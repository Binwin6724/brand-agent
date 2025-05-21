import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import './Sandbox.css';

function Sandbox() {
  const [formData, setFormData] = useState({
    post_prompt: '',
    brand_guidelines: '',
    chatMessages: []
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [formData.chatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setFormData(prev => ({
      ...prev,
      chatMessages: []
    })); // Clear previous chat when submitting new form

    try {
      const payload = {
        human_prompt_start: formData.post_prompt,
        linkedIn_brand_guidelines: formData.brand_guidelines,
        feedback_input: formData.chatMessages.map(msg => msg.text).join('\n') || ' '
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
          } else {
            // If not found in output, try to find in values
            const valuesItem = data.raw_response.find(item => 
              item.value?.values?.linkedIn_post
            );
            
            if (valuesItem) {
              postBody = valuesItem.value.values.linkedIn_post.linkedIn_post_body || '';
              postCTA = valuesItem.value.values.linkedIn_post.linkedIn_post_call_to_action || '';
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
            }
          }
        }

        console.log('Extracted Post Data:', { postBody, postCTA });

        if (!postBody && !postCTA) {
          console.warn('No post data found in response, showing raw response');
          setResponse({
            postBody: 'Could not parse post data. Showing raw response:',
            postCTA: JSON.stringify(data, null, 2)
          });
        } else {
          setResponse({
            postBody,
            postCTA
          });
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        setResponse({
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
        feedback_input: feedbackInput || ' '
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

      // Update the response with the new post data
      setResponse({
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
              ) : response ? (
                <div className="post-container">
                  <div className="post-content">
                    <h3 className="post-title">Generated Post</h3>
                    <p className="post-body">{response.postBody}</p>
                    {response.postCTA && (
                      <div className="mt-4">
                        <p className="text-muted mb-2">Call to Action:</p>
                        <p className="post-cta">{response.postCTA}</p>
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
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100 mt-auto"
                  style={{ marginTop: 'auto' }}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      {' '}Processing...
                    </>
                  ) : 'Generate Post'}
                </Button>
              </Form>

              {response && (
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
