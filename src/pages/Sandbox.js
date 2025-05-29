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
  const [isTyping, setIsTyping] = useState(false);
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
      {/* <div className="d-flex align-items-center" style={{ gap: '10px', marginBottom: '20px' }}>
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
          <view id="AdobeExperienceCloud" viewBox="0 0 250 244" />
          <svg data-name="Layer 1" viewBox="-5 -5 250 244" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <rect height="234" rx="42.5" width="240" fill="#fa0f00" />
            <path
              d="M186.617 175.95h-28.506a6.243 6.243 0 0 1-5.847-3.769l-30.947-72.359a1.364 1.364 0 0 0-2.611-.034L99.42 145.731a1.635 1.635 0 0 0 1.506 2.269h21.2a3.27 3.27 0 0 1 3.01 1.994l9.281 20.655a3.812 3.812 0 0 1-3.507 5.301H53.734a3.518 3.518 0 0 1-3.213-4.904l49.09-116.902A6.639 6.639 0 0 1 105.843 50h28.314a6.628 6.628 0 0 1 6.232 4.144l49.43 116.902a3.517 3.517 0 0 1-3.202 4.904z"
                              data-name="256" fill="#fff" />
          </svg>
        </svg>
        <span className="page-title">Adobe GenStudio</span>
      </div> */}
      {/* <h1 className="page-title">Sandbox 🏖️</h1> */}

      <Row className="g-4">

        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5" className="bg-white d-flex justify-content-between align-items-center">
              <span>Agent</span>
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
                  borderRadius: '0.25rem'
                }}>
                  {formData.chatMessages.length === 0 ? (
                    <div className="text-center text-muted my-5">
                      <p>Start a conversation to generate a LinkedIn post</p>
                    </div>
                  ) : (
                    <>
                      {formData.chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`chat-message ${msg.sender === 'user' ? 'user-message' : msg.sender === 'bot' ? 'bot-message' : 'system-message'}`}
                          style={{
                            whiteSpace: 'pre-line', // Preserve line breaks in messages
                            animationDelay: `${index * 0.1}s` // Staggered animation effect
                          }}
                        >
                          {msg.sender === 'system' && <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Agent Message</div>}
                          <div className="message-content">
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )}
                    </>
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

                        // Add user message to chat with timestamp
                        const updatedChatMessages = [
                          ...formData.chatMessages,
                          {
                            text: chatInput,
                            sender: 'user',
                            timestamp: Date.now()
                          }
                        ];

                        // Add optional fields to chat if they exist
                        const optionalFieldsInfo = [];
                        if (formData.brand_guidelines?.trim()) {
                          optionalFieldsInfo.push(`Brand Guidelines Applied`);
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
                            sender: 'system',
                            timestamp: Date.now()
                          });
                        }

                        setFormData(prev => ({
                          ...prev,
                          chatMessages: updatedChatMessages,
                          post_prompt: chatInput // Set the post_prompt to the latest user message
                        }));
                        setChatInput('');

                        // Show typing indicator
                        setIsTyping(true);

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
                          setIsTyping(false); // Hide the typing indicator when done
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
                      <Form.Label>Brand</Form.Label>
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
                      <Form.Label>Webcrawl Reference <span className="text-muted">(Optional)</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="article_link"
                        value={formData.article_link}
                        onChange={handleInputChange}
                        placeholder="Enter webcrawl reference"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>PDF Reference (e.g., Creative Brief) <span className="text-muted">(Optional)</span></Form.Label>
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
            <Card className="h-100">
              <Card.Header as="h5" className="bg-white">Canvas</Card.Header>
              <Card.Body className="d-flex flex-column">
                {loading ? (
                  <div className="ai-loader-container">
                    <div className="ai-loader-text">Generating your content...</div>
                    <div className="ai-loader-bars">
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                      <div className="ai-loader-bar"></div>
                    </div>
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
                        {/* <div className="post-user-headline">AI Content Generator</div>
                        <div className="post-timestamp">Just now<span className="dot" style={{ backgroundColor: '#6cae4f', width: '6px', height: '6px', display: 'inline-block', borderRadius: '50%' }}></span> <i className="bi bi-globe"></i> </div> */}
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
                          <div className="reaction-icon like-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="like-consumption-medium" data-supported-dps="24x24">
                            <g>
                              <path d="M12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0z" fill="none" />
                              <circle cx="12" cy="12" r="11" fill="#378fe9" />
                              <path d="M11.71 9.54H5.88A1.37 1.37 0 004.5 11 1.43 1.43 0 006 12.34h.25a1.25 1.25 0 00-.1 2.5 1.25 1.25 0 00.52 2.23 1.23 1.23 0 00-.13.88 1.33 1.33 0 001.33 1h3.6a5.54 5.54 0 001.4-.18l2.26-.66h3c1.58-.06 2-7.29 0-7.29h-.86c-.14 0-.23-.3-.62-.72-.58-.62-1.23-1.42-1.69-1.88a11.19 11.19 0 01-2.68-3.46c-.37-.8-.41-1.17-1.18-1.17a1.22 1.22 0 00-1 1.28c0 .42.09.84.16 1.26a12.52 12.52 0 001.55 3.46" fill="#d0e8ff" fill-rule="evenodd" />
                              <path d="M11.71 9.54H5.88a1.43 1.43 0 00-1 .43A1.43 1.43 0 006 12.36h.25A1.23 1.23 0 005 13.61a1.25 1.25 0 001.15 1.25 1.22 1.22 0 00-.47 1.28 1.24 1.24 0 001 .94 1.23 1.23 0 00-.13.88 1.33 1.33 0 001.33 1h3.6a6 6 0 001.4-.18l2.26-.66h3c1.58-.05 2-7.28 0-7.28h-.86c-.14 0-.23-.3-.62-.72-.59-.62-1.24-1.43-1.66-1.88a11.19 11.19 0 01-2.68-3.46c-.37-.81-.41-1.2-1.18-1.17a1.15 1.15 0 00-1 1.28c0 .4.05.81.11 1.21a12.12 12.12 0 001.55 3.44" fill="none" stroke="#004182" stroke-linecap="round" stroke-linejoin="round" />
                            </g>
                          </svg>
                          </div>
                          <div className="reaction-icon celebrate-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="praise-consumption-medium" data-supported-dps="24x24">
                            <defs>
                              <mask id="reactions-praise-consumption-medium-a" x="1" y="1" width="22.37" height="22" maskUnits="userSpaceOnUse">
                                <circle cx="12" cy="12" r="11" fill="#fff" />
                              </mask>
                            </defs>
                            <g>
                              <path d="M12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0z" fill="none" />
                              <circle cx="12" cy="12" r="11" fill="#6dae4f" />
                              <g>
                                <circle cx="12" cy="12" r="11" fill="#6dae4f" />
                              </g>
                              <g mask="url(#reactions-praise-consumption-medium-a)">
                                <path d="M19.86 15l-.71-.53s-.29-2.82-.8-3.36a9.23 9.23 0 01-1.91-3.75c-.24-.83-.41-1.12-1.16-1.14a1.14 1.14 0 00-1 1.26 8.47 8.47 0 00.1 1.13 16.13 16.13 0 00.9 2.89l-.28-.22-6.88-5.2a1.18 1.18 0 00-1.74.11 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.54 2.66 1.06.8-5.66-4.26a1.18 1.18 0 00-.89-.33 1.17 1.17 0 00-.84.44 1.11 1.11 0 00-.17.92 1.1 1.1 0 00.57.74l3.54 2.66 2.12 1.6-4.6-3.46a1.11 1.11 0 00-1.9 1 1.1 1.1 0 00.57.74l3.54 2.66 1.77 1.33-3.54-2.63a1.18 1.18 0 00-.9-.35 1.19 1.19 0 00-.84.41 1.12 1.12 0 00-.19.94 1.15 1.15 0 00.57.77L11 19.38a4.31 4.31 0 003.28.79l1.06.8a12.33 12.33 0 002.48-2.57 17.72 17.72 0 002-3.4z" fill="#dcf0cb" fill-rule="evenodd" />
                                <path d="M15.61 11.76L14.55 11" fill="#93d870" fill-rule="evenodd" />
                                <path d="M19.1 13.94c-.11-.83-.19-3.31-.57-3.71a6.71 6.71 0 01-2.09-2.92c-.24-.83-.41-1.12-1.16-1.14a1.14 1.14 0 00-1 1.26 8.47 8.47 0 00.1 1.13 20.26 20.26 0 00.9 3.06L8.12 6.25a1.16 1.16 0 00-1.74.11A1.16 1.16 0 006.79 8l3.54 2.68 1.06.8-5.66-4.26a1.18 1.18 0 00-.89-.33 1.15 1.15 0 00-.84.44 1.12 1.12 0 00-.17.92A1.14 1.14 0 004.4 9l3.54 2.66 2.12 1.6-4.6-3.47a1.14 1.14 0 00-.89-.34 1.17 1.17 0 00-.85.44 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.54 2.67 1.77 1.33-3.54-2.66a1.14 1.14 0 00-.9-.33 1.11 1.11 0 00-1 1.38 1.16 1.16 0 00.57.76L11 19.38a4.31 4.31 0 003.28.79" fill="none" stroke="#165209" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M22.78 15.48l-.7-.53s-.3-2.82-.81-3.36a9.35 9.35 0 01-1.91-3.75C19.12 7 19 6.72 18.2 6.7a1.08 1.08 0 00-.76.42 1.12 1.12 0 00-.24.88 8.47 8.47 0 00.1 1.13c.28 1.45.58 2.65.62 2.72l-6.77-5.09a1.18 1.18 0 00-1.74.11 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.53 2.66 1.07.8-5.66-4.25a1.18 1.18 0 00-.9-.35 1.08 1.08 0 00-1 1.38 1.19 1.19 0 00.59.73L11 12.17l2.13 1.59-4.64-3.46a1.17 1.17 0 00-.9-.33 1.19 1.19 0 00-.85.44 1.15 1.15 0 00-.16.92 1.14 1.14 0 00.58.74l3.53 2.66 1.77 1.33-3.53-2.66a1.14 1.14 0 00-1.71.07 1.12 1.12 0 00-.19.94 1.16 1.16 0 00.57.76l6.33 4.74a7.09 7.09 0 003.1.94 9.75 9.75 0 001.24.65 5.07 5.07 0 003.19-2 7.61 7.61 0 001.32-4.02z" fill="#ddf6d1" fill-rule="evenodd" />
                                <path d="M7.79 2.72l.35 1.56M12.75 4.63l-1.31.92M10.74 2.43l-1 2.48" fill="none" stroke="#165209" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M7.79 2.72l.35 1.56M12.75 4.63l-1.31.92M10.74 2.43l-1 2.48M7.79 2.72l.35 1.56M12.75 4.63l-1.31.92M10.74 2.43l-1 2.48" fill="#231f20" fill-rule="evenodd" />
                                <path d="M7.59 13.8c.89.69 7 5.39 7.68 5.64a3.28 3.28 0 002.31 0 2.54 2.54 0 00.74-.48M18.06 7.82a18.86 18.86 0 00.69 3.79" fill="none" />
                                <path d="M22.71 15.48A3.24 3.24 0 0122 14.3c-.08-.33-.1-.67-.17-1a3.57 3.57 0 00-.56-1.7 9.35 9.35 0 01-1.91-3.75C19.12 7 19 6.72 18.2 6.7a1.08 1.08 0 00-.76.42 1.12 1.12 0 00-.24.88 8.47 8.47 0 00.1 1.13c.28 1.45.58 2.65.62 2.72l-6.77-5.09a1.18 1.18 0 00-1.74.11 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.53 2.66 1.07.8-5.66-4.25a1.18 1.18 0 00-.9-.35 1.08 1.08 0 00-1 1.38 1.19 1.19 0 00.59.73L11 12.17l2.13 1.59-4.64-3.46a1.17 1.17 0 00-.9-.33 1.19 1.19 0 00-.85.44 1.15 1.15 0 00-.16.92 1.14 1.14 0 00.58.74l3.53 2.66 1.77 1.33-3.53-2.66a1.14 1.14 0 00-1.71.07 1.12 1.12 0 00-.19.94 1.16 1.16 0 00.57.76l6.33 4.74a4.12 4.12 0 001.78.77c.28.06.58.08.91.15a4.41 4.41 0 011.37.45 1.29 1.29 0 001 .08 5.85 5.85 0 002.77-2 5.67 5.67 0 001.1-3.12 1.34 1.34 0 00-.15-.76z" fill="none" stroke="#165209" stroke-linecap="round" stroke-linejoin="round" />
                              </g>
                            </g>
                          </svg>
                          </div>
                          <div className="reaction-icon support-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="empathy-consumption-medium" data-supported-dps="24x24">
                            <g>
                              <path d="M12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0z" fill="none" />
                              <circle cx="12" cy="12" r="11" fill="#df704d" />
                              <path d="M11.54 7.3a4.09 4.09 0 00-5.83 0 4.18 4.18 0 000 5.88L12 19.5l6.29-6.32a4.18 4.18 0 000-5.88 4.1 4.1 0 00-2.92-1.22h0a4.07 4.07 0 00-2.9 1.24l-.47.44z" fill="#fff3f0" stroke="#77280c" fill-rule="evenodd" />
                              <path d="M17.39 7.57a3.12 3.12 0 01.84 1c1.41 2.62-.95 4.26-2.43 5.75-1 1-1.91 1.92-2.9 2.84M8.52 7a3.42 3.42 0 00-1.19.16 2.88 2.88 0 00-1.49 1.28 3.87 3.87 0 00-.48 2v.15" fill="none" />
                              <path d="M11.54 7.22a4.09 4.09 0 00-5.83 0 4.18 4.18 0 000 5.88L12 19.42l6.29-6.32a4.18 4.18 0 000-5.88A4.1 4.1 0 0015.37 6h0a4.06 4.06 0 00-2.9 1.23l-.47.45z" fill="none" stroke="#77280c" stroke-linecap="round" stroke-linejoin="round" />
                            </g>
                          </svg>
                          </div>
                        </div>
                        <span style={{ marginLeft: '3px' }}>142</span>
                      </div>
                      <div className="post-comments">56 comments</div>
                    </div>

                    <div className="post-actions">
                      <div className="post-action-button"><svg xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px', transform: 'scaleX(-1)' }} width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                      </svg> Like</div>
                      <div className="post-action-button"><svg xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px' }} width="16" height="16" fill="currentColor" class="bi bi-chat-text" viewBox="0 0 16 16">
                        <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                        <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5" />
                      </svg> Comment</div>
                      <div className="post-action-button"><svg xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px' }} width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                      </svg> Share</div>
                    </div>
                  </div>
                ) : (console.log())}
              </Card.Body>
            </Card>

            {postResponse && (
              <Card style={{ marginTop: '20px' }}>
                <Card.Header as="h5" className="bg-white">Auto Assigned ID <span className="text-muted">(Horizon ID)</span></Card.Header>
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
                        padding: '0.3rem',
                        marginBottom: '30px',
                        fontSize: '1rem',
                        fontWeight: '400',
                        lineHeight: '1.5',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s ease-in-out',
                        cursor: postResponse?.horizonId ? 'not-allowed' : 'text',
                      }}
                    />
                    {postResponse?.horizonId ? (
                      <Form.Text className="text-muted mt-2">

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
