import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Sandbox from './LinkedInSandbox';
import FacebookSandbox from './FacebookSandbox';
import './GenStudioSandbox.css';

function GenStudioSandbox() {
  const [selectedPlatform, setSelectedPlatform] = useState('facebook'); // Default to Facebook

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
  };

  return (
    <Container fluid>
      <div className="platform-tabs">
        <div 
          className={`platform-tab ${selectedPlatform === 'facebook' ? 'active' : ''}`}
          onClick={() => handlePlatformSelect('facebook')}
        >
          <i className="fab fa-facebook-f"></i>
          <span>Facebook</span>
        </div>
        
        <div 
          className={`platform-tab ${selectedPlatform === 'linkedin' ? 'active' : ''}`}
          onClick={() => handlePlatformSelect('linkedin')}
        >
          <i className="fab fa-linkedin-in"></i>
          <span>LinkedIn</span>
        </div>
      </div>
      
      {selectedPlatform && (
        <div className="content-container">
          {selectedPlatform === 'facebook' ? (
            <FacebookSandbox />
          ) : (
            <Sandbox />
          )}
        </div>
      )}
    </Container>
  );
}

export default GenStudioSandbox;