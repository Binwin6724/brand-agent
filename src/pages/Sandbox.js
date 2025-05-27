import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import './Sandbox.css';

function Sandbox() {
  const [formData, setFormData] = useState({
    post_prompt: '',
    brand_guidelines: '',
    chatMessages: [],
    article_link: '',
    pdf_file: null
  });

  const [loading, setLoading] = useState(false);
  const [postResponse, setPostResponse] = useState(null);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only');
      return;
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `pdf_${timestamp}_${file.name}`;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result;
        
        // Save file to the files directory
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload-pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileName: fileName,
              base64Data: base64Data
            })
          });

          if (!response.ok) {
            throw new Error('Failed to upload PDF');
          }

          setFormData(prev => ({
            ...prev,
            pdf_file: fileName
          }));
        } catch (error) {
          console.error('Error saving PDF:', error);
          alert('Failed to save PDF. Please try again.');
        }
      };
    } catch (error) {
      console.error('Error reading PDF:', error);
      alert('Failed to read PDF. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [formData.chatMessages]);

  const handleClearAll = () => {
    setFormData({
      post_prompt: '',
      brand_guidelines: '',
      chatMessages: [],
      article_link: ''
    });
    setPostResponse(null);
    setError(null);
    setChatInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPostResponse(null);
    setFormData(prev => ({
      ...prev,
      chatMessages: []
    })); // Clear previous chat when submitting new form

    try {
      const payload = {
        human_prompt_start: formData.post_prompt,
        linkedIn_brand_guidelines: formData.brand_guidelines,
        article_link: formData.article_link,
        feedback_input: formData.chatMessages.map(msg => msg.text).join('\n') || ' ',
        pdf_file_path: formData.pdf_file || '',
        feedback_bool: false,
        previous_generated_body: '',
        previous_generated_cta: '',
      };

      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/wordware', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      console.log('API Response:', JSON.stringify(data, null, 2));

      // Extract the post body and CTA from the response
      let postBody = '';
      let postCTA = '';
      let feedbackInput = '';
      let feedbackBool = false;

      try {
        // Handle the raw_response array structure
        if (data.raw_response && Array.isArray(data.raw_response)) {
          // Find the item with the output containing linkedIn_post
          const outputItem = data.raw_response.find(item => 
            item.value?.output?.linkedIn_post
          );
          
          if (outputItem) {
            postBody = outputItem.value.output.linkedIn_post.linkedIn_post_body || '';
            postCTA = outputItem.value.output.linkedIn_post.linkedIn_post_call_to_action || '';
            feedbackInput = outputItem.value.output.linkedIn_post.feedback_input || '';
            feedbackBool = outputItem.value.output.linkedIn_post.feedback_bool || false;
          } else {
            // If not found in output, try to find in values
            const valuesItem = data.raw_response.find(item => 
              item.value?.values?.linkedIn_post
            );
            
            if (valuesItem) {
              postBody = valuesItem.value.values.linkedIn_post.linkedIn_post_body || '';
              postCTA = valuesItem.value.values.linkedIn_post.linkedIn_post_call_to_action || '';
              feedbackInput = valuesItem.value.values.linkedIn_post.feedback_input || '';
              feedbackBool = valuesItem.value.values.linkedIn_post.feedback_bool || false;
            }
          }
          
          // If still not found, try to find the outputs chunk
          if (!postBody && !postCTA) {
            const outputsItem = data.raw_response.find(item => 
              item.type === 'chunk' && item.value?.type === 'outputs'
            );
            
            if (outputsItem?.value?.values?.linkedIn_post) {
              postBody = outputsItem.value.values.linkedIn_post.linkedIn_post_body || '';
              postCTA = outputsItem.value.values.linkedIn_post.linkedIn_post_call_to_action || '';
              feedbackInput = outputsItem.value.values.linkedIn_post.feedback_input || '';
              feedbackBool = outputsItem.value.values.linkedIn_post.feedback_bool || false;
            }
          }
        }

        console.log('Extracted Post Data:', { postBody, postCTA });

        if (!postBody && !postCTA) {
          console.warn('No post data found in response, showing raw response');
          setPostResponse({
            postBody: 'Could not parse post data. Showing raw response:',
            postCTA: JSON.stringify(data, null, 2)
          });
        } else {
          setPostResponse({
            postBody,
            postCTA,
            feedbackInput,
            feedbackBool
          });
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        setPostResponse({
          postBody: 'Error parsing response. Raw data:',
          postCTA: JSON.stringify(data, null, 2)
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message to chat
    const updatedChatMessages = [
      ...formData.chatMessages, 
      { text: chatInput, sender: 'user' }
    ];
    
    setFormData(prev => ({
      ...prev,
      chatMessages: updatedChatMessages
    }));
    setChatInput('');
    setLoading(true);
    setError(null);

    try {
      // Prepare the feedback input by combining all previous messages
      const feedbackInput = updatedChatMessages
        .map(msg => msg.text)
        .join(', ');

      const payload = {
        human_prompt_start: formData.post_prompt,
        linkedIn_brand_guidelines: formData.brand_guidelines,
        feedback_input: feedbackInput || ' ',
        article_link: formData.article_link,
        feedback_bool: (feedbackInput.length > 0) ? true : false,
        previous_generated_body: postResponse?.postBody || '',
        previous_generated_cta: postResponse?.postCTA || '',
      };

      console.log('Feedback Input:', feedbackInput);
      console.log('Payload:', payload);

      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/wordware', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      // Extract the post data from the response
      let postBody = '';
      let postCTA = '';

      if (data.raw_response && Array.isArray(data.raw_response)) {
        const outputItem = data.raw_response.find(item => 
          item.value?.output?.linkedIn_post
        );
        
        if (outputItem) {
          postBody = outputItem.value.output.linkedIn_post.linkedIn_post_body || '';
          postCTA = outputItem.value.output.linkedIn_post.linkedIn_post_call_to_action || '';
        } else {
          const valuesItem = data.raw_response.find(item => 
            item.value?.values?.linkedIn_post
          );
          
          if (valuesItem) {
            postBody = valuesItem.value.values.linkedIn_post.linkedIn_post_body || '';
            postCTA = valuesItem.value.values.linkedIn_post.linkedIn_post_call_to_action || '';
          }
        }
      }

      // Update the post response with the new post data
      setPostResponse({
        postBody,
        postCTA
      });
      
      // Add bot's response to chat
      setFormData(prev => ({
        ...prev,
        chatMessages: [
          ...prev.chatMessages,
          { text: `I've updated the post based on your feedback: "${chatInput}"`, sender: 'bot' }
        ]
      }));
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="page-title">Wordware API Sandbox</h1>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5" className="bg-white">Generated Post</Card.Header>
            <Card.Body className="d-flex flex-column">
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Generating your post...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">
                  <Alert.Heading>Error</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              ) : postResponse ? (
                <div className="post-container">
                  <div className="post-content">
                    <h3 className="post-title">Generated Post</h3>
                    <p className="post-body">{postResponse.postBody}</p>
                    {postResponse.postCTA && (
                      <div className="mt-4">
                        <p className="text-muted mb-2">Call to Action:</p>
                        <p className="post-cta">{postResponse.postCTA}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted p-4">
                  <p>Submit the form to see the generated post</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5" className="bg-white">Wordware API</Card.Header>
            <Card.Body className="d-flex flex-column">
              <Form onSubmit={handleSubmit} className="flex-grow-1 d-flex flex-column">
                <Form.Group className="mb-3">
                  <Form.Label>Post Prompt</Form.Label>
                  <Form.Control
                    type="text"
                    name="post_prompt"
                    value={formData.post_prompt}
                    onChange={handleInputChange}
                    placeholder="Enter post prompt"
                    required
                  />
                  <Form.Text className="text-muted">
                    The prompt must be a valid string
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Brand Guidelines</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand_guidelines"
                    value={formData.brand_guidelines}
                    onChange={handleInputChange}
                    placeholder="Enter brand guidelines"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Article Link <span style={{ color: 'gray', fontSize: '12px' }}>(Optional)</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="article_link"
                    value={formData.article_link}
                    onChange={handleInputChange}
                    placeholder="Enter article link"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Upload PDF File <span style={{ color: 'gray', fontSize: '12px' }}>(Optional)</span></Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                  />
                  {formData.pdf_file && (
                    <Form.Text className="text-muted mt-2">
                      Selected file: {formData.pdf_file.split('/').pop()}
                    </Form.Text>
                  )}
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : 'Generate Post'}
                  </Button>
                  <Button
                    variant="outline-danger"
                    type="button"
                    onClick={handleClearAll}
                    disabled={loading}
                    className="flex-shrink-0"
                  >
                    Clear All
                  </Button>
                </div>
              </Form>

              {postResponse && (
                <div className="mt-4">
                  <hr />
                  <h6 className="mb-3">Chat about this post</h6>
                  <div className="chat-container" style={{ 
                    height: '150px', 
                    overflowY: 'auto', 
                    border: '1px solid #dee2e6',
                    borderRadius: '0.25rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    {formData.chatMessages.length > 0 ? (
                      formData.chatMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`mb-3 d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div 
                            className={`p-2 rounded ${msg.sender === 'user' 
                              ? 'bg-primary text-white' 
                              : 'bg-white border'}`}
                            style={{ maxWidth: '80%' }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted p-4">
                        <p>Ask questions or request changes about the generated post</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <Form onSubmit={handleChatSubmit} className="d-flex">
                    <Form.Control
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="me-2"
                    />
                    <Button 
                      variant="outline-primary" 
                      type="submit"
                      disabled={!chatInput.trim()}
                    >
                      Send
                    </Button>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Sandbox;
