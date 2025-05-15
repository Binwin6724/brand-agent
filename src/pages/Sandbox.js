import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';

function Sandbox() {
  const [formData, setFormData] = useState({
    file_url: '',
    file_name: '',
    file_type: 'text/csv',
    language: 'English',
    headlineLength: 42,
    bodyLength: 42,
    acceptableCTA: ''
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const payload = {
        file_url: formData.file_url,
        file_name: formData.file_name,
        file_type: formData.file_type,
        language: formData.language,
        headlineLength: parseInt(formData.headlineLength),
        bodyLength: parseInt(formData.bodyLength),
        acceptableCTA: formData.acceptableCTA.split(',').map(cta => cta.trim()).filter(cta => cta !== '')
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

      setResponse(data);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const fileTypeOptions = [
    { value: 'text/csv', label: 'CSV' },
    { value: 'application/json', label: 'JSON' },
    { value: 'text/plain', label: 'Plain Text' }
  ];

  return (
    <Container className="mt-4">
      <h1 className="page-title">Wordware API Sandbox</h1>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Wordware API Form</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>File URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="file_url"
                    value={formData.file_url}
                    onChange={handleInputChange}
                    placeholder="Enter URL to your file"
                    required
                  />
                  <Form.Text className="text-muted">
                    The URL must be publicly accessible
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>File Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="file_name"
                    value={formData.file_name}
                    onChange={handleInputChange}
                    placeholder="Enter file name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>File Type</Form.Label>
                  <Form.Select
                    name="file_type"
                    value={formData.file_type}
                    onChange={handleInputChange}
                  >
                    {fileTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Control
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="Enter language"
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Headline Length</Form.Label>
                      <Form.Control
                        type="number"
                        name="headlineLength"
                        value={formData.headlineLength}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Body Length</Form.Label>
                      <Form.Control
                        type="number"
                        name="bodyLength"
                        value={formData.bodyLength}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Acceptable CTAs</Form.Label>
                  <Form.Control
                    type="text"
                    name="acceptableCTA"
                    value={formData.acceptableCTA}
                    onChange={handleInputChange}
                    placeholder="Enter CTAs separated by commas"
                  />
                  <Form.Text className="text-muted">
                    Enter multiple CTAs separated by commas (e.g. "Learn More, Sign Up, Buy Now")
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
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
                  ) : 'Submit'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Response</Card.Header>
            <Card.Body>
              {loading && (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Processing your request...</p>
                </div>
              )}

              {error && (
                <Alert variant="danger">
                  <Alert.Heading>Error</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              )}

              {response && (
                <div>
                  {response.raw_response && (
                    <div className="mt-4">
                      <h5>Raw Response:</h5>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {typeof response.raw_response === 'object' ? JSON.stringify(response.raw_response, null, 2) : String(response.raw_response)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {!loading && !error && !response && (
                <div className="text-center text-muted p-4">
                  <p>Submit the form to see the API response here</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header as="h5">About Wordware API</Card.Header>
        <Card.Body>
          <p>
            This sandbox allows you to interact with the Wordware AI API for generating content.
            The API takes a file URL, language preferences, and content parameters to generate
            headlines and body text with appropriate CTAs.
          </p>
          <p>
            <strong>Instructions:</strong>
          </p>
          <ol>
            <li>Enter a publicly accessible URL to your data file (CSV, JSON, or text)</li>
            <li>Provide a file name for reference</li>
            <li>Select the appropriate file type</li>
            <li>Specify your preferred language</li>
            <li>Set the desired headline and body text lengths</li>
            <li>Enter acceptable CTAs (call-to-actions) separated by commas</li>
            <li>Click Submit to process your request</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Sandbox;
