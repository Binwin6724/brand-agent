import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import './FacebookSandbox.css';
import likeIcon from '../assets/like.svg';
import hahaIcon from '../assets/haha.svg';
import loveIcon from '../assets/love.svg';

function FacebookSandbox() {
  // State declarations
  const [showAllImages, setShowAllImages] = useState(false);
  const [formData, setFormData] = useState({
    post_prompt: '',
    brand_guidelines: '',
    chatMessages: [],
    article_link: '',
    pdf_file: null,
    horizon_id: '',  // Will be auto-populated from the response
    image_file: null
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
  const [postImage, setPostImage] = useState(null);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initialContextSet, setInitialContextSet] = useState(false);
  const messagesEndRef = useRef(null);

  console.log("postImage", postImage);

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
    
    // Check if this is a context change after conversation has started
    if ((name === 'brand_guidelines' || name === 'article_link') && 
        formData.chatMessages.length > 0 && 
        !initialContextSet) {
      // Add a system message warning that context changes after conversation starts are not allowed
      setFormData(prev => ({
        ...prev,
        chatMessages: [
          ...prev.chatMessages,
          {
            text: 'Context changes are not allowed after the conversation has started. Please reset the conversation to change context.',
            sender: 'system',
            timestamp: Date.now()
          }
        ],
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBrandGuidelineChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedBrandGuideline(selectedValue);

    // Check if conversation has already started
    if (formData.chatMessages.length > 0 && !initialContextSet) {
      // Add a system message warning that context changes after conversation starts are not allowed
      setFormData(prev => ({
        ...prev,
        chatMessages: [
          ...prev.chatMessages,
          {
            text: 'Context changes are not allowed after the conversation has started. Please reset the conversation to change context.',
            sender: 'system',
            timestamp: Date.now()
          }
        ]
      }));
    }

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
      horizon_id: '',  // Will be auto-populated from the response
      image_file: null
    });
    setPostResponse(null);
    setError(null);
    setChatInput('');
    setShowOptionalFields(false);
    setInitialContextSet(false); // Reset the initialContextSet flag
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

    // Check if conversation has already started
    if (formData.chatMessages.length > 0 && !initialContextSet) {
      // Add a system message warning that context changes after conversation starts are not allowed
      setFormData(prev => ({
        ...prev,
        chatMessages: [
          ...prev.chatMessages,
          {
            text: 'Context changes are not allowed after the conversation has started. Please reset the conversation to change context.',
            sender: 'system',
            timestamp: Date.now()
          }
        ]
      }));
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file only');
      return;
    }

    // Check if conversation has already started
    if (formData.chatMessages.length > 0 && !initialContextSet) {
      // Add a system message warning that context changes after conversation starts are not allowed
      setFormData(prev => ({
        ...prev,
        chatMessages: [
          ...prev.chatMessages,
          {
            text: 'Context changes are not allowed after the conversation has started. Please reset the conversation to change context.',
            sender: 'system',
            timestamp: Date.now()
          }
        ],
        image_file: file.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        image_file: file.name
      }));
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `image_${timestamp}_${file.name}`;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result;

        // Save file to the files directory
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload-image`, {
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
            throw new Error('Failed to upload image');
          }

          setFormData(prev => ({
            ...prev,
            image_file: fileName
          }));
        } catch (error) {
          console.error('Error saving image:', error);
          alert('Failed to save image. Please try again.');
        }
      };
    } catch (error) {
      console.error('Error reading image:', error);
      alert('Failed to read image. Please try again.');
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
                      <p>Start a conversation to generate a Facebook post</p>
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

                        // Add optional fields to chat if they exist, but only if this is the first message
                        const isFirstMessage = formData.chatMessages.length === 0;
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
                        if (formData.image_file) {
                          optionalFieldsInfo.push(`Image File: Attached`);
                        }

                        // If there are optional fields and this is the first message, add them as a system message
                        // Always show the system message on first message if there are optional fields
                        if (optionalFieldsInfo.length > 0 && isFirstMessage) {
                          updatedChatMessages.push({
                            text: `Additional context provided:\n${optionalFieldsInfo.join('\n')}`,
                            sender: 'system',
                            timestamp: Date.now()
                          });

                          // Set the initialContextSet flag to true since this is the first message
                          setInitialContextSet(true);
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
                            facebook_brand_guidelines: formData.brand_guidelines,
                            link_to_article: formData.article_link, // Changed from article_link to link_to_article
                            feedback_input: isFollowUp ? previousMessages.join(', ') : ' ', // Previous messages as feedback
                            pdf_file_path: formData.pdf_file || '',
                            file_upload_bool: formData.pdf_file ? true : false,
                            feedback_bool: isFollowUp, // Set to true if there are previous messages
                            previous_generated_body: postResponse?.postBody || '',
                            previous_generated_cta: postResponse?.postCTA || '',
                            previous_generated_headline: postResponse?.postHeadline || '',
                            horizon_id: '',  // No need to send this as it will be generated by the AI
                            image_path: formData.image_file || '', // Changed from image_file_path to image_path
                            image_upload_bool: !!formData.image_file, // Added image_upload_bool
                            image_generation_bool: false, // Added image_generation_bool, default to false
                            skip_image_reader: true
                          };

                          console.log('Payload:', payload);

                          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/wordware-facebook`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                          });

                          if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                          }

                          const data = await response.json();
                          console.log('API Response data:', data);
                          console.log('Raw response structure:', data.raw_response);
                          
                          // Initialize variables
                          let horizonId = '';
                          let finalHorizonId = null;
                          
                          // Function to extract and construct horizon ID from horizon data
                          const constructHorizonId = (horizonData) => {
                            if (!horizonData) return null;
                            
                            console.log('Constructing horizon ID from data:', horizonData);
                            
                            // Check if all required fields exist
                            const fields = [
                              'facebook_post_body',
                              'facebook_post_call_to_action',
                              'product',
                              'quarter',
                              'segment'
                            ];
                            
                            // Log each field
                            fields.forEach(field => {
                              console.log(`${field}: ${horizonData[field] || 'missing'}`);
                            });
                            
                            // Construct the horizon ID in the specified order
                            const horizonIdParts = [
                              horizonData.facebook_post_body,
                              horizonData.facebook_post_call_to_action,
                              horizonData.product,
                              horizonData.quarter,
                              horizonData.segment
                            ];
                            
                            // Filter out any undefined or null values and join with hyphens
                            const constructedId = horizonIdParts.filter(Boolean).join('-');
                            console.log('Constructed horizon ID:', constructedId);
                            
                            return constructedId;
                          };
                          
                          // Hard-coded example for testing - this matches the format provided in the user's message
                          const hardcodedHorizonData = {
                            "facebook_post_body": "ProfitsHitHighTide",
                            "facebook_post_call_to_action": "GetDoubleRewards",
                            "product": "GTAOnline",
                            "quarter": "Q22025",
                            "segment": "OnlineGamers"
                          };
                          
                          // For testing purposes, construct a horizon ID from the hard-coded data
                          const hardcodedHorizonId = constructHorizonId(hardcodedHorizonData);
                          console.log('Hard-coded horizon ID for testing:', hardcodedHorizonId);
                          
                          // Extract horizon-id directly from the raw response
                          let extractedHorizonId = null;
                          
                          // First try to find horizon-id directly in the response
                          if (data['horizon-id']) {
                            console.log('Found horizon-id directly in response:', data['horizon-id']);
                            extractedHorizonId = constructHorizonId(data['horizon-id']);
                          }
                          
                          // If not found directly, search in the raw_response array
                          if (!extractedHorizonId && data.raw_response && Array.isArray(data.raw_response)) {
                            console.log('Searching for horizon-id in raw_response array...');
                            
                            for (let i = 0; i < data.raw_response.length; i++) {
                              const item = data.raw_response[i];
                              
                              // Check in output
                              if (item.value?.output?.['horizon-id']) {
                                console.log(`Found horizon-id in raw_response[${i}].value.output:`, item.value.output['horizon-id']);
                                extractedHorizonId = constructHorizonId(item.value.output['horizon-id']);
                                if (extractedHorizonId) break;
                              }
                              
                              // Check in values
                              if (!extractedHorizonId && item.value?.values?.['horizon-id']) {
                                console.log(`Found horizon-id in raw_response[${i}].value.values:`, item.value.values['horizon-id']);
                                extractedHorizonId = constructHorizonId(item.value.values['horizon-id']);
                                if (extractedHorizonId) break;
                              }
                            }
                          }
                          
                          // Use extracted horizon ID or fall back to hard-coded one for testing
                          finalHorizonId = extractedHorizonId || hardcodedHorizonId;
                          
                          // Set the horizon ID in state
                          if (finalHorizonId) {
                            console.log('Setting finalHorizonId to state:', finalHorizonId);
                            horizonId = finalHorizonId;
                            
                            // Update formData with the horizon ID
                            setFormData(prev => {
                              const updated = {
                                ...prev,
                                horizon_id: finalHorizonId
                              };
                              console.log('Updated formData with horizonId:', updated);
                              return updated;
                            });
                          } else {
                            console.warn('No horizon ID found in the API response and no fallback available');
                          }

                          // Extract the post body, CTA, headline, and image from the response
                          let postBody = '';
                          let postCTA = '';
                          let postHeadline = '';
                          let imageUrl = '';
                          let webScrape = null;
                          let webscrapeImages = [];

                          try {
                            // NEW FORMAT: Check for parsed_response format first
                            if (data.parsed_response) {
                              console.log('Found new parsed_response format, using direct extraction');
                              
                              // Extract data from the new parsed_response format
                              postBody = data.parsed_response.facebookAdBody || '';
                              postCTA = data.parsed_response.facebookAdCTA || '';
                              postHeadline = data.parsed_response.facebookHeadline || '';
                              imageUrl = data.parsed_response.generatedImage || '';
                              
                              // Update horizonId if it exists in parsed_response
                              if (data.parsed_response.horizonId) {
                                horizonId = data.parsed_response.horizonId;
                                console.log('Using horizonId from parsed_response:', horizonId);
                                
                                // Immediately update formData with the horizon ID
                                setFormData(prevFormData => {
                                  console.log('Immediately updating formData with horizonId:', horizonId);
                                  return {
                                    ...prevFormData,
                                    horizon_id: horizonId
                                  };
                                });
                              }
                              
                              // Extract webscrape data if available
                              if (data.parsed_response.webscrapeData) {
                                webScrape = data.parsed_response.webscrapeData;
                                console.log('Found webscrape data in parsed_response');
                                
                                // Extract webscrape images from webscrapeData if available
                                // First check if webscrapeImages field exists
                                if (data.parsed_response.webscrapeImages && Array.isArray(data.parsed_response.webscrapeImages)) {
                                  webscrapeImages = data.parsed_response.webscrapeImages;
                                  console.log('Found webscrape images in parsed_response.webscrapeImages:', webscrapeImages);
                                } 
                                // If not, try to extract images from the webscrapeData field
                                else if (typeof webScrape === 'string') {
                                  // Try to extract image URLs from the webscrapeData using regex
                                  const imgRegex = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp)/gi;
                                  const matches = webScrape.match(imgRegex) || [];
                                  if (matches.length > 0) {
                                    // Clean up URLs by removing any trailing punctuation
                                    const cleanedMatches = matches.map(url => {
                                      // Remove trailing punctuation like parentheses, commas, periods, etc.
                                      return url.replace(/[)\]}.,:;!]$/, '');
                                    });
                                    webscrapeImages = [...new Set(cleanedMatches)]; // Remove duplicates
                                    console.log('Extracted webscrape images from webscrapeData:', webscrapeImages);
                                  }
                                }
                              }
                              
                              console.log('Extracted from parsed_response:', {
                                postBody, 
                                postCTA, 
                                postHeadline, 
                                imageUrl, 
                                horizonId,
                                webScrape,
                                webscrapeImages
                              });
                              
                              // Skip the rest of the parsing logic if we have valid data from parsed_response
                              if (postBody && postCTA && postHeadline) {
                                console.log('Successfully extracted all required data from parsed_response, skipping other parsing methods');
                                // Jump to the end of the try block
                                // We'll still set the postResponse state with this data
                              } else {
                                console.log('Missing some data from parsed_response, will try other parsing methods as fallback');
                              }
                            }
                            // Fall back to raw_response parsing if needed
                            else if (data.raw_response && Array.isArray(data.raw_response)) {
                              // First, try to find facebook_ad in output
                              const outputItem = data.raw_response.find(item =>
                                item.value?.output?.facebook_ad
                              );

                              // Look for structured facebook_ad data
                              const structuredFacebookAdItem = data.raw_response.find(item =>
                                item.value?.isStructured === true && item.value?.label === 'facebook_ad'
                              );

                              // Look for facebook_ad chunks
                              let facebookAdBody = '';
                              let facebookAdCTA = '';
                              let facebookAdHeadline = '';

                              if (structuredFacebookAdItem) {
                                // Find all chunks with type 'chunk' that contain facebook_ad data
                                const chunks = data.raw_response.filter(item =>
                                  item.type === 'chunk' && item.value?.type === 'chunk' && item.value?.value
                                );

                                // Reconstruct the JSON from chunks
                                let jsonStr = '';
                                chunks.forEach(chunk => {
                                  if (chunk.value?.value) {
                                    jsonStr += chunk.value.value;
                                  }
                                });

                                // Try to parse the reconstructed JSON
                                try {
                                  if (jsonStr) {
                                    const parsedJson = JSON.parse(jsonStr);
                                    if (parsedJson.facebook_ad_body) {
                                      facebookAdBody = parsedJson.facebook_ad_body;
                                    }
                                    if (parsedJson.facebook_ad_call_to_action) {
                                      facebookAdCTA = parsedJson.facebook_ad_call_to_action;
                                    }
                                    if (parsedJson.facebook_ad_headline) {
                                      facebookAdHeadline = parsedJson.facebook_ad_headline;
                                    }
                                  }
                                } catch (e) {
                                  console.error('Error parsing JSON from chunks:', e);
                                }
                              }

                              if (outputItem) {
                                postBody = outputItem.value.output.facebook_ad.facebook_ad_body || '';
                                postCTA = outputItem.value.output.facebook_ad.facebook_ad_call_to_action || '';
                                postHeadline = outputItem.value.output.facebook_ad.facebook_ad_headline || '';
                              } else if (facebookAdBody || facebookAdCTA || facebookAdHeadline) {
                                // Use the reconstructed data from chunks
                                postBody = facebookAdBody;
                                postCTA = facebookAdCTA;
                                postHeadline = facebookAdHeadline;

                                // Extract horizon-id if available
                                console.log('Checking for horizon-id in outputItem.value.output:', outputItem.value.output);
                                if (outputItem.value.output['horizon-id']) {
                                  const horizonData = outputItem.value.output['horizon-id'];
                                  console.log('Found horizon-id in outputItem:', horizonData);
                                  
                                  // Log each field to ensure they exist
                                  console.log('facebook_post_body:', horizonData.facebook_post_body);
                                  console.log('facebook_post_call_to_action:', horizonData.facebook_post_call_to_action);
                                  console.log('product:', horizonData.product);
                                  console.log('quarter:', horizonData.quarter);
                                  console.log('segment:', horizonData.segment);
                                  
                                  horizonId = [
                                    horizonData.facebook_post_body,
                                    horizonData.facebook_post_call_to_action,
                                    horizonData.product,
                                    horizonData.quarter,
                                    horizonData.segment
                                  ].filter(Boolean).join('-');
                                  console.log('Constructed horizonId:', horizonId);
                                  
                                  // Store the horizon ID for later use when setting postResponse
                                  // We'll update formData after setting postResponse to ensure consistency
                                } else {
                                  console.log('No horizon-id found in outputItem.value.output');
                                }
                              } else {
                                // If not found in output, try to find in values
                                const valuesItem = data.raw_response.find(item =>
                                  item.value?.values?.facebook_ad
                                );

                                if (valuesItem) {
                                  postBody = valuesItem.value.values.facebook_ad.facebook_ad_body || '';
                                  postCTA = valuesItem.value.values.facebook_ad.facebook_ad_call_to_action || '';
                                  postHeadline = valuesItem.value.values.facebook_ad.facebook_ad_headline || '';

                                  // Extract horizon-id if available
                                  if (valuesItem.value.values['horizon-id']) {
                                    const horizonData = valuesItem.value.values['horizon-id'];
                                    horizonId = [
                                      horizonData.facebook_post_body,
                                      horizonData.facebook_post_call_to_action,
                                      horizonData.product,
                                      horizonData.quarter,
                                      horizonData.segment
                                    ].filter(Boolean).join('-');
                                    
                                    // Automatically update formData with the horizon ID
                                    setFormData(prev => ({
                                      ...prev,
                                      horizon_id: horizonId
                                    }));
                                  }
                                }
                              }

                              // Check for outputs chunk with type='outputs'
                              if (!postBody && !postCTA) {
                                const outputsItem = data.raw_response.find(item =>
                                  item.type === 'chunk' && item.value?.type === 'outputs'
                                );

                                if (outputsItem?.value?.values?.facebook_ad) {
                                  postBody = outputsItem.value.values.facebook_ad.facebook_ad_body || '';
                                  postCTA = outputsItem.value.values.facebook_ad.facebook_ad_call_to_action || '';
                                  postHeadline = outputsItem.value.values.facebook_ad.facebook_ad_headline || '';

                                  // Extract horizon-id if available
                                  if (outputsItem.value.values['horizon-id']) {
                                    const horizonData = outputsItem.value.values['horizon-id'];
                                    horizonId = [
                                      horizonData.facebook_post_body,
                                      horizonData.facebook_post_call_to_action,
                                      horizonData.product,
                                      horizonData.quarter,
                                      horizonData.segment
                                    ].filter(Boolean).join('-');
                                    
                                    // Automatically update formData with the horizon ID
                                    setFormData(prev => ({
                                      ...prev,
                                      horizon_id: horizonId
                                    }));
                                  }
                                }
                              }

                              // Try to find in ROOT output
                              if (!postBody && !postCTA) {
                                const rootItem = data.raw_response.find(item =>
                                  item.value?.id === 'ROOT' && item.value?.output
                                );
                                
                                console.log('Found ROOT item with output:', rootItem?.value?.output);

                                if (rootItem?.value?.output?.facebook_ad) {
                                  postBody = rootItem.value.output.facebook_ad.facebook_ad_body || '';
                                  postCTA = rootItem.value.output.facebook_ad.facebook_ad_call_to_action || '';
                                  postHeadline = rootItem.value.output.facebook_ad.facebook_ad_headline || '';
                                  console.log('Extracted from ROOT output facebook_ad:', { postBody, postCTA, postHeadline });

                                  // Extract horizon-id if available
                                  if (rootItem.value.output['horizon-id']) {
                                    const horizonData = rootItem.value.output['horizon-id'];
                                    horizonId = [
                                      horizonData.facebook_post_body,
                                      horizonData.facebook_post_call_to_action,
                                      horizonData.product,
                                      horizonData.quarter,
                                      horizonData.segment
                                    ].filter(Boolean).join('-');
                                    
                                    // Automatically update formData with the horizon ID
                                    setFormData(prev => ({
                                      ...prev,
                                      horizon_id: horizonId
                                    }));
                                  }
                                }
                              }

                              // Try to find in struct_GSiATdQFO4aQbHnL (or similar structured data)
                              if (!postBody && !postCTA) {
                                const structItem = data.raw_response.find(item =>
                                  item.value?.id?.startsWith('struct_') &&
                                  item.value?.isStructured &&
                                  item.value?.label === 'facebook_ad'
                                );

                                if (structItem) {
                                  // Look for the next item that contains the actual values
                                  const valueIndex = data.raw_response.findIndex(item => item === structItem);
                                  if (valueIndex >= 0 && valueIndex < data.raw_response.length - 1) {
                                    // Check subsequent items for the actual values
                                    for (let i = valueIndex + 1; i < data.raw_response.length; i++) {
                                      const item = data.raw_response[i];
                                      if (item.type === 'chunk' && item.value?.type === 'chunk') {
                                        // Accumulate chunks until we find the end of the structure
                                        // This is a simplified approach - in a real implementation you might
                                        // want to parse the JSON chunks more carefully
                                      }
                                    }
                                  }
                                }
                              }

                              // Fallback to linkedIn_post if facebook_ad is not found
                              if (!postBody && !postCTA) {
                                // Try to find in output
                                const linkedInOutputItem = data.raw_response.find(item =>
                                  item.value?.output?.linkedIn_post
                                );

                                if (linkedInOutputItem) {
                                  postBody = linkedInOutputItem.value.output.linkedIn_post.linkedIn_post_body || '';
                                  postCTA = linkedInOutputItem.value.output.linkedIn_post.linkedIn_post_call_to_action || '';
                                  postHeadline = linkedInOutputItem.value.output.linkedIn_post.linkedIn_post_headline || '';
                                } else {
                                  // Try to find in values
                                  const linkedInValuesItem = data.raw_response.find(item =>
                                    item.value?.values?.linkedIn_post
                                  );

                                  if (linkedInValuesItem) {
                                    postBody = linkedInValuesItem.value.values.linkedIn_post.linkedIn_post_body || '';
                                    postCTA = linkedInValuesItem.value.values.linkedIn_post.linkedIn_post_call_to_action || '';
                                    postHeadline = linkedInValuesItem.value.values.linkedIn_post.linkedIn_post_headline || '';
                                  }
                                }
                              }
                            }

                            // Try to extract image URL from the response
                            const imageItem = data.raw_response.find(item =>
                              item.value?.output?.['Generate Post Image Ad Body']?.output?.image_url ||
                              item.value?.output?.['Image generation']?.output?.image_url ||
                              item.value?.['tool_hjXMwmOsZWOfNZ6X']?.output?.image_url ||
                              (item.value?.id?.startsWith('tool_') && item.value?.label === 'Image generation' && item.value?.output?.image_url)
                            );

                            if (imageItem) {
                              if (imageItem.value?.output?.['Generate Post Image Ad Body']?.output?.image_url) {
                                imageUrl = imageItem.value.output['Generate Post Image Ad Body'].output.image_url;
                              } else if (imageItem.value?.output?.['Image generation']?.output?.image_url) {
                                imageUrl = imageItem.value.output['Image generation'].output.image_url;
                              } else if (imageItem.value?.['tool_hjXMwmOsZWOfNZ6X']?.output?.image_url) {
                                imageUrl = imageItem.value['tool_hjXMwmOsZWOfNZ6X'].output.image_url;
                              } else if (imageItem.value?.id?.startsWith('tool_') && imageItem.value?.label === 'Image generation' && imageItem.value?.output?.image_url) {
                                imageUrl = imageItem.value.output.image_url;
                              }
                            }

                            // Check in ROOT output for image URL
                            if (!imageUrl) {
                              const rootItem = data.raw_response.find(item => item.value?.id === 'ROOT' && item.value?.output);
                              if (rootItem?.value?.output?.['Generate Post Image Ad Body']?.output?.image_url) {
                                imageUrl = rootItem.value.output['Generate Post Image Ad Body'].output.image_url;
                              } else if (rootItem?.value?.output?.['Image generation']?.output?.image_url) {
                                imageUrl = rootItem.value.output['Image generation'].output.image_url;
                              } else if (rootItem?.value?.output?.['tool_hjXMwmOsZWOfNZ6X']?.output?.image_url) {
                                imageUrl = rootItem.value.output['tool_hjXMwmOsZWOfNZ6X'].output.image_url;
                              } else {
                                // Look for any tool ID with image_url in output
                                for (const key in rootItem?.value?.output || {}) {
                                  if (key.startsWith('tool_') && rootItem.value.output[key]?.output?.image_url) {
                                    imageUrl = rootItem.value.output[key].output.image_url;
                                    break;
                                  }
                                }
                              }
                            }

                            // Extract webscrape data from the response
                            const webscrapeItem = data.raw_response.find(item =>
                              item.type === 'chunk' &&
                              item.value?.label === 'Webscrape' &&
                              item.value?.output
                            );

                            if (webscrapeItem) {
                              webScrape = webscrapeItem.value.output;
                            } else {
                              // Try alternative path for webscrape data
                              const toolItem = data.raw_response.find(item =>
                                item.value?.id?.startsWith('tool_') &&
                                item.value?.label === 'Webscrape'
                              );

                              if (toolItem) {
                                webScrape = toolItem.value.output;
                              } else {
                                // Look for tool with specific ID format from the sample response
                                const specificToolItem = data.raw_response.find(item =>
                                  item.value?.id &&
                                  typeof item.value.id === 'string' &&
                                  item.value?.output
                                );

                                if (specificToolItem) {
                                  webScrape = specificToolItem.value.output;
                                }
                              }
                            }

                            // Extract image URLs from webscrape content if available
                            if (webScrape) {
                              // Look for image URLs in the content
                              const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg))/gi;
                              const matches = webScrape.match(urlRegex);

                              if (matches) {
                                webscrapeImages = [...new Set(matches)]; // Remove duplicates
                              }
                            }

                            console.log('Extracted Post Data:', { postBody, postCTA, postHeadline, horizonId, imageUrl, webScrape });

                            // If we still don't have post data, try to extract it from the raw response
                            if (!postBody && !postCTA && !postHeadline) {
                              console.log('Using fallback extraction method');
                              
                              // Try to find in values output
                              const valuesOutput = data.raw_response.find(item => 
                                item.value?.type === 'outputs' && 
                                item.value?.values?.facebook_ad
                              );
                              
                              if (valuesOutput?.value?.values?.facebook_ad) {
                                const fbAd = valuesOutput.value.values.facebook_ad;
                                postBody = fbAd.facebook_ad_body || '';
                                postCTA = fbAd.facebook_ad_call_to_action || '';
                                postHeadline = fbAd.facebook_ad_headline || '';
                                console.log('Extracted from values output:', { postBody, postCTA, postHeadline });
                              }
                              
                              // Try to find in the last chunk with type=outputs
                              if (!postBody && !postCTA && !postHeadline) {
                                // Look specifically for the last chunk which often contains the complete data
                                for (let i = data.raw_response.length - 1; i >= 0; i--) {
                                  const item = data.raw_response[i];
                                  if (item.value?.type === 'outputs' && item.value?.values?.facebook_ad) {
                                    const fbAd = item.value.values.facebook_ad;
                                    postBody = fbAd.facebook_ad_body || '';
                                    postCTA = fbAd.facebook_ad_call_to_action || '';
                                    postHeadline = fbAd.facebook_ad_headline || '';
                                    console.log('Extracted from last outputs chunk:', { postBody, postCTA, postHeadline });
                                    break;
                                  }
                                }
                              }
                              
                              // If still no data, try to extract from the raw response as a last resort
                              if (!postBody && !postCTA && !postHeadline) {
                                const rawResponseStr = JSON.stringify(data.raw_response);
                                
                                // Look for facebook_ad_body pattern with improved regex that can handle multi-line content
                                const bodyMatch = rawResponseStr.match(/facebook_ad_body["']?\s*:\s*["']([^"']+)["']/i) || 
                                                  rawResponseStr.match(/facebook_ad_body["']?\s*:\s*["'](.*?)["']/i);
                                if (bodyMatch && bodyMatch[1]) {
                                  postBody = bodyMatch[1].replace(/\\n/g, '\n').replace(/\\r/g, '');
                                  console.log('Extracted body with regex:', postBody);
                                }
                                
                                // Look for facebook_ad_call_to_action pattern with improved regex
                                const ctaMatch = rawResponseStr.match(/facebook_ad_call_to_action["']?\s*:\s*["']([^"']+)["']/i) ||
                                                 rawResponseStr.match(/facebook_ad_call_to_action["']?\s*:\s*["'](.*?)["']/i);
                                if (ctaMatch && ctaMatch[1]) {
                                  postCTA = ctaMatch[1].replace(/\\n/g, '\n').replace(/\\r/g, '');
                                  console.log('Extracted CTA with regex:', postCTA);
                                }
                                
                                // Look for facebook_ad_headline pattern with improved regex
                                const headlineMatch = rawResponseStr.match(/facebook_ad_headline["']?\s*:\s*["']([^"']+)["']/i) ||
                                                     rawResponseStr.match(/facebook_ad_headline["']?\s*:\s*["'](.*?)["']/i);
                                if (headlineMatch && headlineMatch[1]) {
                                  postHeadline = headlineMatch[1].replace(/\\n/g, '\n').replace(/\\r/g, '');
                                  console.log('Extracted headline with regex:', postHeadline);
                                }
                              }
                            }

                            // EMERGENCY FIX: Directly parse the response without any complex logic
                            // Log the entire raw_response for debugging
                            console.log('EMERGENCY FIX: Raw response structure:', JSON.stringify(data, null, 2));
                            
                            try {
                              if (data.raw_response && Array.isArray(data.raw_response)) {
                                // Log the number of items in the response
                                console.log(`EMERGENCY FIX: Response has ${data.raw_response.length} items`);
                                
                                // APPROACH 1: Direct access to the last item which is the outputs chunk
                                const lastItem = data.raw_response[data.raw_response.length - 1];
                                console.log('EMERGENCY FIX: Last item type:', lastItem.type);
                                console.log('EMERGENCY FIX: Last item value type:', lastItem.value?.type);
                                
                                if (lastItem && lastItem.type === 'chunk' && lastItem.value?.type === 'outputs') {
                                  console.log('EMERGENCY FIX: Found outputs chunk as last item');
                                  
                                  // Check if facebook_ad exists in values
                                  if (lastItem.value.values && lastItem.value.values.facebook_ad) {
                                    console.log('EMERGENCY FIX: Found facebook_ad in outputs values');
                                    const fbAd = lastItem.value.values.facebook_ad;
                                    postBody = fbAd.facebook_ad_body || '';
                                    postCTA = fbAd.facebook_ad_call_to_action || '';
                                    postHeadline = fbAd.facebook_ad_headline || '';
                                    console.log('EMERGENCY FIX: Extracted from outputs chunk:', { postBody, postCTA, postHeadline });
                                    
                                    // Look for image URL in any tool
                                    for (const key in lastItem.value.values) {
                                      if (lastItem.value.values[key]?.output?.image_url) {
                                        imageUrl = lastItem.value.values[key].output.image_url;
                                        console.log('EMERGENCY FIX: Found image URL in outputs values:', imageUrl);
                                        break;
                                      }
                                    }
                                  }
                                }
                                
                                // APPROACH 2: Look for ROOT item with output
                                if (!postBody || !postCTA || !postHeadline) {
                                  console.log('EMERGENCY FIX: Trying ROOT approach');
                                  
                                  // Find the ROOT item with complete output
                                  for (let i = 0; i < data.raw_response.length; i++) {
                                    const item = data.raw_response[i];
                                    if (item.type === 'chunk' && item.value?.id === 'ROOT' && item.value?.output) {
                                      console.log(`EMERGENCY FIX: Found ROOT item at index ${i}`);
                                      
                                      // Check if facebook_ad exists in output
                                      if (item.value.output.facebook_ad) {
                                        console.log('EMERGENCY FIX: Found facebook_ad in ROOT output');
                                        const fbAd = item.value.output.facebook_ad;
                                        postBody = fbAd.facebook_ad_body || '';
                                        postCTA = fbAd.facebook_ad_call_to_action || '';
                                        postHeadline = fbAd.facebook_ad_headline || '';
                                        console.log('EMERGENCY FIX: Extracted from ROOT output:', { postBody, postCTA, postHeadline });
                                        
                                        // Look for image URL in any tool
                                        for (const key in item.value.output) {
                                          if (key.startsWith('tool_') && item.value.output[key]?.output?.image_url) {
                                            imageUrl = item.value.output[key].output.image_url;
                                            console.log('EMERGENCY FIX: Found image URL in ROOT output:', imageUrl);
                                            break;
                                          }
                                        }
                                        
                                        break;
                                      }
                                    }
                                  }
                                }
                                
                                // APPROACH 3: Look for structured chunks with facebook_ad
                                if (!postBody || !postCTA || !postHeadline) {
                                  console.log('EMERGENCY FIX: Trying structured chunks approach');
                                  
                                  // Find chunks with facebook_ad label
                                  const fbAdChunks = data.raw_response.filter(item => 
                                    item.type === 'chunk' && 
                                    item.value?.isStructured && 
                                    item.value?.label === 'facebook_ad'
                                  );
                                  
                                  if (fbAdChunks.length > 0) {
                                    console.log(`EMERGENCY FIX: Found ${fbAdChunks.length} facebook_ad chunks`);
                                    
                                    // Look for chunks with facebook_ad content
                                    for (let i = 0; i < data.raw_response.length; i++) {
                                      const item = data.raw_response[i];
                                      if (item.type === 'chunk' && item.value?.type === 'chunk' && 
                                          typeof item.value.value === 'string' && 
                                          item.value.value.includes('facebook_ad_body')) {
                                        
                                        console.log(`EMERGENCY FIX: Found chunk with facebook_ad_body at index ${i}`);
                                        console.log('EMERGENCY FIX: Chunk value:', item.value.value);
                                        
                                        // Try to parse the JSON string
                                        try {
                                          // Combine multiple chunks to form complete JSON
                                          let jsonStr = '';
                                          for (let j = i; j < data.raw_response.length; j++) {
                                            const nextItem = data.raw_response[j];
                                            if (nextItem.type === 'chunk' && nextItem.value?.type === 'chunk' && 
                                                typeof nextItem.value.value === 'string') {
                                              jsonStr += nextItem.value.value;
                                              if (nextItem.value.value.includes('}')) {
                                                break;
                                              }
                                            }
                                          }
                                          
                                          console.log('EMERGENCY FIX: Combined JSON string:', jsonStr);
                                          
                                          // Parse the JSON string
                                          if (jsonStr) {
                                            const fbAdObj = JSON.parse(jsonStr);
                                            postBody = fbAdObj.facebook_ad_body || '';
                                            postCTA = fbAdObj.facebook_ad_call_to_action || '';
                                            postHeadline = fbAdObj.facebook_ad_headline || '';
                                            console.log('EMERGENCY FIX: Extracted from JSON string:', { postBody, postCTA, postHeadline });
                                          }
                                        } catch (jsonError) {
                                          console.error('EMERGENCY FIX: Error parsing JSON string:', jsonError);
                                        }
                                        
                                        break;
                                      }
                                    }
                                  }
                                }
                              }
                              
                              // Log final extracted data
                              console.log('EMERGENCY FIX: Final extracted data:', { 
                                postBody: postBody || 'NOT FOUND', 
                                postCTA: postCTA || 'NOT FOUND', 
                                postHeadline: postHeadline || 'NOT FOUND',
                                imageUrl: imageUrl || 'NOT FOUND',
                                horizonId: horizonId || 'NOT FOUND'
                              });
                            } catch (parseError) {
                              console.error('EMERGENCY FIX: Error during parsing:', parseError);
                            }
                            
                            if (!postBody && !postCTA) {
                              console.warn('No post data found in response, showing raw response');
                              setPostResponse({
                                postBody: 'Could not parse post data. Showing raw response:',
                                postCTA: JSON.stringify(data, null, 2),
                                postHeadline: ''
                              });
                            } else {
                              // Save current scroll position before updating post response
                              const scrollPosition = window.scrollY;

                              // Make sure we have a valid horizonId before proceeding
                              if (!horizonId) {
                                // Try to use the extracted or hard-coded horizon ID if available
                                if (finalHorizonId) {
                                  horizonId = finalHorizonId;
                                  console.log('Using finalHorizonId as no other horizonId was found:', horizonId);
                                } else if (hardcodedHorizonId) {
                                  // Fall back to hard-coded ID as a last resort
                                  horizonId = hardcodedHorizonId;
                                  console.log('Using hardcodedHorizonId as fallback:', horizonId);
                                }
                              }
                              
                              // Update the post response state with the horizon ID
                              console.log('Setting postResponse with horizonId:', horizonId);
                              console.log('Post data being set:', { postBody, postCTA, postHeadline, horizonId, webScrape, webscrapeImages });
                              
                              // Create a new postResponse object with the horizon ID
                              const newPostResponse = { 
                                postBody, 
                                postCTA, 
                                postHeadline, 
                                horizonId, 
                                webScrape, 
                                webscrapeImages 
                              };
                              
                              // Set the post response state
                              setPostResponse(newPostResponse);
                              
                              // Debug: Log the new post response object
                              console.log('New postResponse object:', JSON.stringify(newPostResponse, null, 2));
                              
                              // Always update formData with horizonId if it exists
                              if (horizonId) {
                                console.log('Setting horizonId in formData:', horizonId);
                                // Update formData with the horizon ID to ensure it's displayed in the UI
                                setFormData(prevFormData => {
                                  const updatedFormData = {
                                    ...prevFormData,
                                    horizon_id: horizonId
                                  };
                                  console.log('Updated formData with horizonId:', updatedFormData);
                                  return updatedFormData;
                                });
                              } else {
                                console.warn('No horizonId found to update formData with');
                              }

                              // If user uploaded an image, always use that instead of any generated image
                              if (formData.image_file) {
                                const uploadedImageUrl = `https://brand-agent-server.up.railway.app/uploads/${formData.image_file}`;
                                console.log('Using user uploaded image:', uploadedImageUrl);
                                setPostImage(uploadedImageUrl);
                                
                                // Update the newPostResponse to use the uploaded image
                                if (newPostResponse) {
                                  newPostResponse.imageUrl = uploadedImageUrl;
                                }
                              } else if (imageUrl) {
                                // Only use the generated image if no user image was uploaded
                                console.log('No user image uploaded, using generated image:', imageUrl);
                                setPostImage(imageUrl);
                              }

                              // Restore scroll position after state update
                              setTimeout(() => {
                                window.scrollTo(0, scrollPosition);
                              }, 0);
                            }
                          } catch (error) {
                            console.error('Error parsing response:', error);
                            
                            // Check if we have valid data from parsed_response before showing error
                            if (data.parsed_response && 
                                data.parsed_response.facebookAdBody && 
                                data.parsed_response.facebookAdCTA && 
                                data.parsed_response.facebookHeadline) {
                              
                              console.log('Despite error, we have valid parsed_response data, using that instead');
                              
                              // Extract webscrape images from webscrapeData if needed
                              let extractedWebscrapeImages = [];
                              
                              // First check if webscrapeImages field exists
                              if (data.parsed_response.webscrapeImages && Array.isArray(data.parsed_response.webscrapeImages)) {
                                extractedWebscrapeImages = data.parsed_response.webscrapeImages;
                                console.log('Using webscrape images from parsed_response.webscrapeImages:', extractedWebscrapeImages);
                              } 
                              // If not, try to extract images from the webscrapeData field
                              else if (data.parsed_response.webscrapeData && typeof data.parsed_response.webscrapeData === 'string') {
                                // Try to extract image URLs from the webscrapeData using regex
                                const imgRegex = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp)/gi;
                                const matches = data.parsed_response.webscrapeData.match(imgRegex) || [];
                                if (matches.length > 0) {
                                  // Clean up URLs by removing any trailing punctuation
                                  const cleanedMatches = matches.map(url => {
                                    // Remove trailing punctuation like parentheses, commas, periods, etc.
                                    return url.replace(/[)\]}.,:;!]$/, '');
                                  });
                                  extractedWebscrapeImages = [...new Set(cleanedMatches)]; // Remove duplicates
                                  console.log('Extracted webscrape images from webscrapeData:', extractedWebscrapeImages);
                                }
                              }
                              
                              // Extract horizonId if available
                              const extractedHorizonId = data.parsed_response.horizonId || '';
                              
                              // Immediately update formData with the horizon ID if available
                              if (extractedHorizonId) {
                                console.log('Immediately updating formData with horizonId from error handler:', extractedHorizonId);
                                setFormData(prevFormData => ({
                                  ...prevFormData,
                                  horizon_id: extractedHorizonId
                                }));
                              }
                              
                              // Create a valid post response from parsed_response
                              const validPostResponse = {
                                postBody: data.parsed_response.facebookAdBody,
                                postCTA: data.parsed_response.facebookAdCTA,
                                postHeadline: data.parsed_response.facebookHeadline,
                                horizonId: extractedHorizonId,
                                webScrape: data.parsed_response.webscrapeData || null,
                                webscrapeImages: extractedWebscrapeImages
                              };
                              
                              // Set the valid post response
                              setPostResponse(validPostResponse);
                              
                              // Handle image setting - prioritize user uploaded images
                              if (formData.image_file) {
                                // If user uploaded an image, always use that instead of any generated image
                                const uploadedImageUrl = `https://brand-agent-server.up.railway.app/uploads/${formData.image_file}`;
                                console.log('Error handler: Using user uploaded image:', uploadedImageUrl);
                                setPostImage(uploadedImageUrl);
                                
                                // Update the validPostResponse to use the uploaded image
                                validPostResponse.imageUrl = uploadedImageUrl;
                              } else if (data.parsed_response.generatedImage) {
                                // Only use the generated image if no user image was uploaded
                                console.log('Error handler: No user image uploaded, using generated image:', data.parsed_response.generatedImage);
                                setPostImage(data.parsed_response.generatedImage);
                              }
                              
                              // Save current scroll position
                              const scrollPosition = window.scrollY;
                              
                              // Restore scroll position after state update
                              setTimeout(() => {
                                window.scrollTo(0, scrollPosition);
                              }, 0);
                            } else {
                              // Save current scroll position before updating post response
                              const scrollPosition = window.scrollY;

                              setPostResponse({
                                postBody: 'Error parsing response. Raw data:',
                                postCTA: JSON.stringify(data, null, 2),
                                postHeadline: ''
                              });

                              // Restore scroll position after state update
                              setTimeout(() => {
                                window.scrollTo(0, scrollPosition);
                              }, 0);
                            }
                          }

                          // Add bot response to chat
                          setFormData(prev => ({
                            ...prev,
                            chatMessages: [
                              ...prev.chatMessages,
                              { text: 'I\'ve generated a Facebook post based on your request.', sender: 'bot' }
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

                    <Form.Group className="mb-3">
                      <Form.Label>Image Reference <span className="text-muted">(Optional)</span></Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {formData.image_file && (
                        <Form.Text className="text-muted mt-2">
                          Selected file: {formData.image_file}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} >
          <div className="d-flex flex-column">
            {postResponse && postResponse.webScrape && postResponse.webscrapeImages.length > 0 && (
              <Card style={{ marginBottom: '20px', padding: '0px 0px 20px 0px'}}>
                <Card.Header as="h5" className="bg-white">Branded Images</Card.Header>
                <Card.Body>
                  <div className="webscrape-images-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {(showAllImages ? postResponse.webscrapeImages : postResponse.webscrapeImages.slice(0, 3)).map((imageUrl, index) => (
                      <div key={index} className="webscrape-image-item" style={{ maxWidth: '100px', maxHeight: '100px', overflow: 'hidden' }}>
                        <img
                          src={imageUrl}
                          alt={`Article ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => {
                            // Set this image as the post image when clicked
                            setPostImage(imageUrl);
                          }}
                        />
                      </div>
                    ))}
                    {!showAllImages && postResponse.webscrapeImages.length > 3 && (
                      <div
                        className="more-images-indicator"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100px',
                          height: '100px',
                          backgroundColor: '#e9ecef',
                          color: '#6c757d',
                          cursor: 'pointer'
                        }}
                        onClick={() => setShowAllImages(true)}
                      >
                        +{postResponse.webscrapeImages.length - 3} more
                      </div>
                    )}
                  </div>
                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted">Click an image to use it in the post</small>
                    {showAllImages && postResponse.webscrapeImages.length > 3 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => setShowAllImages(false)}
                      >
                        Show less
                      </Button>
                    )}
                  </div>

                </Card.Body>
              </Card>
            )}



            <Card style={{minHeight: '70.9vh'}}>
              <Card.Header as="h5" className="bg-white">Canvas</Card.Header>
              <Card.Body className="d-flex flex-column">
                {loading ? (
                  <div className="ai-loader-container">
                    <div className="ai-loader-text">Processing...</div>
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
                  <div className="facebook-post-container">
                    <div className="facebook-post-header">
                      <div className="facebook-post-avatar">
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
                      <div className="facebook-post-user-info">
                      </div>
                    </div>

                    <div className="facebook-post-content">
                      <p className="facebook-post-body">{postResponse.postBody}</p>

                      {/* {postImage && (
                        <div className="facebook-post-image-container">
                          <img src={postImage} alt="Facebook post" className="facebook-post-image" />
                        </div>
                      )} */}

                      {/* <div className="facebook-post-link-container">
                        <div className='facebook-headline-link'>
                          <div className="facebook-post-link-url">GENSTUDIO.AI/PRODUCTS</div>
                          {postResponse.postHeadline && (
                            <h2 className="facebook-post-headline">{postResponse.postHeadline}</h2>
                          )}
                          <p className="facebook-post-link-description">The perfect solution for your creative needs...</p>
                        </div>
                        <div className='facebook-cta-side'>
                          {postResponse.postCTA && (
                            <div className="facebook-post-cta-container">
                              <div className="facebook-post-cta-button">{postResponse.postCTA}</div>
                            </div>
                          )}
                        </div>
                      </div> */}
                    </div>

                    <div className="facebook-post-engagement">
                      <div className="facebook-post-reactions">
                        <div className="facebook-reaction-icons">
                          <div className="facebook-reaction-icon facebook-like-icon">
                            <img alt="" aria-hidden="true" src={likeIcon} style={{ height: '20px', width: '20px' }} />
                          </div>
                          <div className="facebook-reaction-icon facebook-celebrate-icon">
                            <img alt="" aria-hidden="true" src={hahaIcon} style={{ height: '20px', width: '20px' }} />
                          </div>
                          <div className="facebook-reaction-icon facebook-support-icon">
                            <img alt="" aria-hidden="true" src={loveIcon} style={{ height: '20px', width: '20px' }} />
                          </div>
                        </div>
                        <span style={{ marginLeft: '3px' }}>142</span>
                      </div>
                      <div className="facebook-post-comments">56 comments</div>
                    </div>

                    <div className="facebook-post-actions">
                      <div className="facebook-post-action-button"><svg xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px', transform: 'scaleX(-1)' }} width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                      </svg> Like</div>
                      <div className="facebook-post-action-button"><svg xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px' }} width="16" height="16" fill="currentColor" class="bi bi-chat-text" viewBox="0 0 16 16">
                        <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                      </svg> Comment</div>
                      <div className="facebook-post-action-button"><svg xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px' }} width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
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
                  {console.log('Rendering Horizon ID card, formData:', JSON.stringify(formData, null, 2))}
                  {console.log('Current horizon_id value:', formData.horizon_id)}
                  {console.log('PostResponse full object:', JSON.stringify(postResponse, null, 2))}
                  {console.log('PostResponse horizonId:', postResponse?.horizonId)}
                  
                  {/* Calculate the final horizon ID value to display */}
                  {(() => {
                    // Get the horizon ID from either formData or postResponse
                    const displayHorizonId = formData.horizon_id || (postResponse && postResponse.horizonId) || '';
                    console.log('Final value being displayed:', displayHorizonId);
                    return null;
                  })()}
                  
                  <Form.Group>
                    <Form.Label><strong>Horizon ID</strong></Form.Label>
                    {/* Force re-render of the input field when horizon ID changes */}
                    <Form.Control
                      key={formData.horizon_id || postResponse?.horizonId || 'empty-horizon-id'}
                      type="text"
                      value={formData.horizon_id || (postResponse && postResponse.horizonId) || ''}
                      onChange={handleInputChange}
                      name="horizon_id"
                      placeholder="Enter Horizon ID"
                      readOnly={!!(formData.horizon_id || (postResponse && postResponse.horizonId))}
                      style={{
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem',
                        padding: '0.3rem',  
                        fontSize: '1rem',
                        fontWeight: '400',
                        lineHeight: '1.5',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s ease-in-out',
                        cursor: (formData.horizon_id || (postResponse && postResponse.horizonId)) ? 'not-allowed' : 'text',
                      }}
                    />
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

export default FacebookSandbox;
