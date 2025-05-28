import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import './Sandbox.css';

function Sandbox() {
  // State declarations
  const [formData, setFormData] = useState({
    post_prompt: '',
    brand_guidelines: '',
    chatMessages: [],
    article_link: '',
    pdf_file: null,
    horizon_id: ''
  });

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postResponse, setPostResponse] = useState(null);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [formData.chatMessages]);

  // Form handling functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearAll = () => {
    setFormData({
      post_prompt: '',
      brand_guidelines: '',
      chatMessages: [],
      article_link: '',
      pdf_file: null,
      horizon_id: ''
    });
    setPostResponse(null);
    setError(null);
    setChatInput('');
    setShowOptionalFields(false);
  };

  // File handling functions
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

  return (
    <Container className="mt-4">
      {/* <h1 className="page-title">Sandbox 🏖️</h1> */}

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
                  <div className="post-header">
                    <div className="post-avatar">A</div>
                    <div className="post-user-info">
                      <div className="post-user-name">GenStudio AI</div>
                      <div className="post-user-headline">AI Content Generator</div>
                      <div className="post-timestamp">Just now<span className="dot" style={{ backgroundColor: '#6cae4f', width: '6px', height: '6px', display: 'inline-block', borderRadius: '50%' }}></span> <i className="bi bi-globe"></i> </div>
                    </div>
                  </div>

                  <div className="post-content">
                    <p className="post-body">{postResponse.postBody}</p>

                    {postResponse.postCTA && (
                      <div className="post-cta-container">
                        <div className="post-cta-button">{postResponse.postCTA}</div>
                      </div>
                    )}
                  </div>

                  <div className="post-engagement">
                    <div className="post-reactions">
                      <div className="reaction-icons">
                        <div className="reaction-icon like-icon">👍</div>
                        <div className="reaction-icon celebrate-icon">🎉</div>
                        <div className="reaction-icon support-icon">❤️</div>
                      </div>
                      <span>42 reactions</span>
                    </div>
                    <div className="post-comments">8 comments</div>
                  </div>

                  <div className="post-actions">
                    <div className="post-action-button">Like</div>
                    <div className="post-action-button">Comment</div>
                    <div className="post-action-button">Share</div>
                  </div>

                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid #dee2e6', padding: '1rem' }}>
                    <Form.Group>
                      <Form.Label>Horizon ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={postResponse?.horizonId || formData.horizon_id}
                        onChange={handleInputChange}
                        name="horizon_id"
                        placeholder="Enter Horizon ID"
                        readOnly={!!postResponse?.horizonId}
                      />
                      {postResponse?.horizonId && (
                        <Form.Text className="text-muted">
                          Auto-generated from API response
                        </Form.Text>
                      )}
                    </Form.Group>
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
            <Card.Header as="h5" className="bg-white">LinkedIn Agent</Card.Header>
            <Card.Body>
              <Form>
                <div className="chat-container mb-4" style={{
                  height: '300px',
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.25rem',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  {formData.chatMessages.length === 0 ? (
                    <div className="text-center text-muted my-5">
                      <p>Start a conversation to generate a LinkedIn post</p>
                    </div>
                  ) : (
                    formData.chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`chat-message ${msg.sender === 'user' ? 'user-message' : msg.sender === 'bot' ? 'bot-message' : 'system-message'}`}
                        style={{
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          backgroundColor: msg.sender === 'user' ? '#007bff' : msg.sender === 'bot' ? '#e9ecef' : '#fffde7',
                          color: msg.sender === 'user' ? 'white' : 'black',
                          alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                          marginLeft: msg.sender === 'user' ? 'auto' : '0',
                          maxWidth: '80%',
                          border: msg.sender === 'system' ? '1px dashed #ccc' : 'none',
                          fontSize: msg.sender === 'system' ? '0.85rem' : '1rem',
                          fontStyle: msg.sender === 'system' ? 'italic' : 'normal',
                          whiteSpace: 'pre-line' // Preserve line breaks in messages
                        }}
                      >
                        {msg.sender === 'system' && <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>System</div>}
                        {msg.text}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Enter your prompt <span className="text-danger">*</span></Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          e.preventDefault();
                          document.getElementById('send-button').click();
                        }
                      }}
                      placeholder="What kind of LinkedIn post would you like to create?"
                      className="me-2"
                      required
                    />
                    <Button
                      id="send-button"
                      variant="primary"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!chatInput.trim()) return;

                        // Add user message to chat
                        const updatedChatMessages = [
                          ...formData.chatMessages,
                          { text: chatInput, sender: 'user' }
                        ];
                        
                        // Add optional fields to chat if they exist
                        const optionalFieldsInfo = [];
                        if (formData.brand_guidelines?.trim()) {
                          optionalFieldsInfo.push(`Brand Guidelines: ${formData.brand_guidelines}`);
                        }
                        if (formData.article_link?.trim()) {
                          optionalFieldsInfo.push(`Article Link: ${formData.article_link}`);
                        }
                        if (formData.pdf_file) {
                          optionalFieldsInfo.push(`PDF File: Attached`);
                        }
                        
                        // If there are optional fields, add them as a system message
                        if (optionalFieldsInfo.length > 0 && showOptionalFields) {
                          updatedChatMessages.push({
                            text: `Additional context provided:\n${optionalFieldsInfo.join('\n')}`,
                            sender: 'system'
                          });
                        }

                        setFormData(prev => ({
                          ...prev,
                          chatMessages: updatedChatMessages,
                          post_prompt: chatInput // Set the post_prompt to the latest user message
                        }));
                        setChatInput('');

                        // Generate post (same as handleSubmit)
                        setLoading(true);
                        setError(null);
                        setPostResponse(null);

                        try {
                          // Get previous messages for feedback input
                          // Use updatedChatMessages instead of formData.chatMessages to include the latest messages
                          const previousMessages = updatedChatMessages
                            .filter(msg => msg.sender === 'user' && msg.text !== chatInput) // Exclude current message
                            .map(msg => msg.text);
                          
                          // Determine if this is a follow-up message
                          const isFollowUp = previousMessages.length > 0;
                          
                          const payload = {
                            human_prompt_start: chatInput, // Current message is always the human prompt
                            linkedIn_brand_guidelines: formData.brand_guidelines,
                            article_link: formData.article_link,
                            feedback_input: isFollowUp ? previousMessages.join(', ') : ' ', // Previous messages as feedback
                            pdf_file_path: formData.pdf_file || '',
                            file_upload_bool: formData.pdf_file ? true : false,
                            feedback_bool: isFollowUp, // Set to true if there are previous messages
                            previous_generated_body: postResponse?.postBody || '',
                            previous_generated_cta: postResponse?.postCTA || '',
                            horizon_id: formData.horizon_id || ''
                          };
                          
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

                          // Extract the post body and CTA from the response
                          let postBody = '';
                          let postCTA = '';
                          let horizonId = '';

                          try {
                            // Handle the raw_response array structure
                            if (data.raw_response && Array.isArray(data.raw_response)) {
                              // First, try to find in output
                              const outputItem = data.raw_response.find(item =>
                                item.value?.output?.linkedIn_post
                              );

                              if (outputItem) {
                                postBody = outputItem.value.output.linkedIn_post.linkedIn_post_body || '';
                                postCTA = outputItem.value.output.linkedIn_post.linkedIn_post_call_to_action || '';
                                
                                // Extract horizon-id if available
                                if (outputItem.value.output['horizon-id']) {
                                  const horizonData = outputItem.value.output['horizon-id'];
                                  horizonId = [
                                    horizonData.segment,
                                    horizonData.product,
                                    horizonData.quarter,
                                    horizonData.linkedin_post_body,
                                    horizonData.linkedin_post_call_to_action
                                  ].filter(Boolean).join('-');
                                }
                              } else {
                                // If not found in output, try to find in values
                                const valuesItem = data.raw_response.find(item =>
                                  item.value?.values?.linkedIn_post
                                );

                                if (valuesItem) {
                                  postBody = valuesItem.value.values.linkedIn_post.linkedIn_post_body || '';
                                  postCTA = valuesItem.value.values.linkedIn_post.linkedIn_post_call_to_action || '';
                                  
                                  // Extract horizon-id if available
                                  if (valuesItem.value.values['horizon-id']) {
                                    const horizonData = valuesItem.value.values['horizon-id'];
                                    horizonId = [
                                      horizonData.segment,
                                      horizonData.product,
                                      horizonData.quarter,
                                      horizonData.linkedin_post_body,
                                      horizonData.linkedin_post_call_to_action
                                    ].filter(Boolean).join('-');
                                  }
                                }
                              }

                              // If still not found, try to find in outputs chunk
                              if (!postBody && !postCTA) {
                                const outputsItem = data.raw_response.find(item =>
                                  item.type === 'outputs'
                                );

                                if (outputsItem?.value?.values?.linkedIn_post) {
                                  postBody = outputsItem.value.values.linkedIn_post.linkedIn_post_body || '';
                                  postCTA = outputsItem.value.values.linkedIn_post.linkedIn_post_call_to_action || '';
                                  
                                  
                                  // Extract horizon-id if available
                                  if (outputsItem.value.values['horizon-id']) {
                                    const horizonData = outputsItem.value.values['horizon-id'];
                                    horizonId = [
                                      horizonData.segment,
                                      horizonData.product,
                                      horizonData.quarter,
                                      horizonData.linkedin_post_body,
                                      horizonData.linkedin_post_call_to_action
                                    ].filter(Boolean).join('-');
                                  }
                                }
                              }
                            }

                            console.log('Extracted Post Data:', { postBody, postCTA, horizonId });

                            if (!postBody && !postCTA) {
                              console.warn('No post data found in response, showing raw response');
                              setPostResponse({
                                postBody: 'Could not parse post data. Showing raw response:',
                                postCTA: JSON.stringify(data, null, 2)
                              });
                            } else {
                              setPostResponse({ postBody, postCTA, horizonId });
                            }
                          } catch (error) {
                            console.error('Error parsing response:', error);
                            setPostResponse({
                              postBody: 'Error parsing response. Raw data:',
                              postCTA: JSON.stringify(data, null, 2)
                            });
                          }

                          // Add bot response to chat
                          setFormData(prev => ({
                            ...prev,
                            chatMessages: [
                              ...prev.chatMessages,
                              { text: 'I\'ve generated a LinkedIn post based on your request.', sender: 'bot' }
                            ]
                          }));
                        } catch (err) {
                          setError(err.message || 'An error occurred while processing your request');

                          // Add error message to chat
                          setFormData(prev => ({
                            ...prev,
                            chatMessages: [
                              ...prev.chatMessages,
                              { text: `Error: ${err.message || 'An error occurred'}`, sender: 'bot' }
                            ]
                          }));
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={!chatInput.trim() || loading}
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
                        </>
                      ) : 'Send'}
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    Your prompt will be used to generate the LinkedIn post
                  </Form.Text>
                </Form.Group>



                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                    >
                      <span style={{ fontSize: '18px' }}>{showOptionalFields ? '−' : '+'}</span>
                    </Button>
                    <small className="text-muted">{showOptionalFields ? 'Hide options' : 'More options'}</small>
                  </div>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    type="button"
                    onClick={handleClearAll}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                </div>

                {showOptionalFields && (
                  <div className="optional-fields border rounded p-3 mb-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Brand Guidelines</Form.Label>
                      <Form.Control
                        type="text"
                        name="brand_guidelines"
                        value={formData.brand_guidelines}
                        onChange={handleInputChange}
                        placeholder="Enter brand guidelines"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Article Link</Form.Label>
                      <Form.Control
                        type="text"
                        name="article_link"
                        value={formData.article_link}
                        onChange={handleInputChange}
                        placeholder="Enter article link"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Upload PDF File</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                      />
                      {formData.pdf_file && (
                        <Form.Text className="text-muted mt-2">
                          Selected file: {formData.pdf_file}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Sandbox;
