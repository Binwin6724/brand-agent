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

  // Predefined brand guidelines
  const brandGuidelinesOptions = [
    {
      label: "Okta Brand",
      content: `*Tone of voice*
Be candid and straightforward
Be direct and use simple language.
Be optimistic, but realistic
Colloquialisms, words or phrases used in ordinary or familiar conversation are acceptable as long as they're well-known
Do not use overly negative language and scenarios
Write in a clear and confident way that highlights benefits, and avoid exaggeration or big claims like "infinite possibilities" or "game-changing."
Use language that conveys real benefits and simplicity without leaning on overused words or clichés like "effortlessly" or "seamlessly."

*Brand values*
Relentlessly committed
Universally trusted
Intentionally neutral
Customer-focused
Innovative

*Editorial guidelines*
Capitalize 'Identity' when referring to the product category
Do not modify campaign lines or taglines
Enhance copy with proof points and stats
Capitalize Okta-specific products, solutions, features, and team names.
Use the Oxford comma
Use one word, no space or hyphen, for login, logon, logoff, or logout as a noun
Follow AP style guide for numbers
MUST use sentence case consistently throughout. Capitalize only the first word of each sentence and proper nouns.
Use end punctuation

*Editorial restrictions*
Do not modify or remove language
Do not replace 'Auth0' with 'customer identity cloud'
Do not repeat words
Do not use negative language or scenarios
Don't talk down to the customers
Don't use technical jargon
Don't promise a 'magic wand' solution
Use a calm, confident tone without exclamation marks.`
    },
    {
      label: "Adobe DX 2023", content: `*Tone of voice*
Speak as executives to executives
Sound confident, not arrogant
Be clear and direct, not basic or simple
Maintain a professional, not long-winded, tone
Be relatable, not conversational
Assume an MBA-level of education in your audience
Use technical terms accurately, avoiding convoluted language
Keep sentences short

*Editorial guidelines*
Use an active voice
Use serial commas
Use contractions to avoid sounding overly formal
Use facts rather than hyperbole
Em dashes get a space on either side in digital content
Lists, bullets, and series should be consistent — either they all start with a noun or they all start with a verb
Headlines are sentence case unless they are report titles functioning as headlines. In this instance, use title case.
Sentence-case headlines are followed by terminal punctuation. Incomplete sentences do not take terminal punctuation.

*Editorial restrictions*
Do not use acronyms for Adobe products
Do not use ampersands; spell out 'and'
Do not abbreviate categories or use acronyms
Do not use version numbers in marketing content
Do not talk about competitors
Avoid terms like 'the fastest', 'the best', or 'the only'
Avoid title case for categories unless in menus or subheads` },
    { label: "Custom", content: "" }
  ];

  const [selectedBrandGuideline, setSelectedBrandGuideline] = useState("Custom");
  const [isCustomGuideline, setIsCustomGuideline] = useState(true);

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postResponse, setPostResponse] = useState(null);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  // Utility functions
  const scrollToBottom = () => {
    // Only scroll the chat container, not the whole page
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.closest('.chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Only scroll the chat messages, not the entire page
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

  const handleBrandGuidelineChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedBrandGuideline(selectedValue);

    if (selectedValue === "Custom") {
      setIsCustomGuideline(true);
      // Keep the current value if switching back to custom
    } else {
      setIsCustomGuideline(false);
      // Find the selected guideline content
      const selectedGuideline = brandGuidelinesOptions.find(option => option.label === selectedValue);
      if (selectedGuideline) {
        setFormData(prev => ({
          ...prev,
          brand_guidelines: selectedGuideline.content
        }));
      }
    }
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
            <Card.Header as="h5" className="bg-white d-flex justify-content-between align-items-center">
              <span>Agent POC</span>
              <Button
                variant="outline-danger"
                size="sm"
                type="button"
                onClick={handleClearAll}
                disabled={loading}
              >
                Reset
              </Button>
            </Card.Header>
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
                      placeholder="Instructions"
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
                              // Save current scroll position before updating post response
                              const scrollPosition = window.scrollY;

                              setPostResponse({ postBody, postCTA, horizonId });

                              // Restore scroll position after state update
                              setTimeout(() => {
                                window.scrollTo(0, scrollPosition);
                              }, 0);
                            }
                          } catch (error) {
                            console.error('Error parsing response:', error);
                            // Save current scroll position before updating post response
                            const scrollPosition = window.scrollY;

                            setPostResponse({
                              postBody: 'Error parsing response. Raw data:',
                              postCTA: JSON.stringify(data, null, 2)
                            });

                            // Restore scroll position after state update
                            setTimeout(() => {
                              window.scrollTo(0, scrollPosition);
                            }, 0);
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
                    <small className="text-muted">{showOptionalFields ? 'Hide Context' : 'Add Additional Context'}</small>
                  </div>
                </div>

                {showOptionalFields && (
                  <div className="optional-fields border rounded p-3 mb-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Brand Guidelines</Form.Label>
                      <div className="mb-2">
                        <Form.Select
                          value={selectedBrandGuideline}
                          onChange={handleBrandGuidelineChange}
                          className="mb-2"
                        >
                          {brandGuidelinesOptions.map(option => (
                            <option key={option.label} value={option.label}>{option.label}</option>
                          ))}
                        </Form.Select>
                      </div>
                      {isCustomGuideline ? (
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="brand_guidelines"
                          value={formData.brand_guidelines}
                          onChange={handleInputChange}
                          placeholder="Enter custom brand guidelines"
                        />
                      ) : (
                        <div
                          className="p-2 border rounded"
                          style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            backgroundColor: '#f8f9fa',
                            whiteSpace: 'pre-line',
                            fontSize: '0.875rem'
                          }}
                        >
                          {/* Don't show the actual content for predefined guidelines */}
                          <p className="text-muted mb-0">{selectedBrandGuideline} guidelines selected</p>
                        </div>
                      )}
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

        <Col md={6}>
          <div className="d-flex flex-column h-100">
            <Card className="mb-3">
              <Card.Header as="h5" className="bg-white">Content Canvas</Card.Header>
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
                      <div className="post-avatar">
                        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                          <view id="AdobeExperienceCloud" viewBox="0 0 250 244" /><svg data-name="Layer 1" viewBox="-5 -5 250 244" width="30"
                            height="30" xmlns="http://www.w3.org/2000/svg">
                            <rect height="234" rx="42.5" width="240" fill="#fa0f00" />
                            <path
                              d="M186.617 175.95h-28.506a6.243 6.243 0 0 1-5.847-3.769l-30.947-72.359a1.364 1.364 0 0 0-2.611-.034L99.42 145.731a1.635 1.635 0 0 0 1.506 2.269h21.2a3.27 3.27 0 0 1 3.01 1.994l9.281 20.655a3.812 3.812 0 0 1-3.507 5.301H53.734a3.518 3.518 0 0 1-3.213-4.904l49.09-116.902A6.639 6.639 0 0 1 105.843 50h28.314a6.628 6.628 0 0 1 6.232 4.144l49.43 116.902a3.517 3.517 0 0 1-3.202 4.904z"
                              data-name="256" fill="#fff" />
                          </svg>
                        </svg>
                      </div>
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
                  </div>
                ) : (
                  <div className="text-center text-muted p-4">
                    <p>Provide instructions to generate content</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {postResponse && (
              <Card>
                <Card.Header as="h5" className="bg-white">Horizon ID</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={postResponse?.horizonId || formData.horizon_id}
                      onChange={handleInputChange}
                      name="horizon_id"
                      placeholder="Enter Horizon ID"
                      readOnly={!!postResponse?.horizonId}
                      style={{
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem',
                        padding: '0.375rem 0.75rem',
                        fontSize: '1rem',
                        fontWeight: '400',
                        lineHeight: '1.5',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s ease-in-out',
                        cursor: postResponse?.horizonId ? 'not-allowed' : 'text'
                      }}
                    />
                    {postResponse?.horizonId ? (
                      <Form.Text className="text-muted mt-2">
                        Auto-generated from API response
                      </Form.Text>
                    ) : (
                      <Form.Text className="text-muted mt-2">
                        Enter a custom Horizon ID or generate a post to get an auto-generated ID
                      </Form.Text>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>

      </Row>


    </Container>
  );
}

export default Sandbox;
