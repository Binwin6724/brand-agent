import React, { useState } from 'react';
import './Assets.css';

function Assets() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle dropped files here
    const files = e.dataTransfer.files;
    console.log('Dropped files:', files);
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    console.log('Selected files:', files);
  };

  const handleFolderUpload = (e) => {
    const files = e.target.files;
    console.log('Selected folder files:', files);
  };

  return (
    <div className="assets-container">
      <h2 className="upload-title">Upload</h2>
      <div 
        className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="cloud-icon">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ECDC4" />
                  <stop offset="100%" stopColor="#7A5FEA" />
                </linearGradient>
              </defs>
              <path d="M90 82.5C98.2843 82.5 105 75.7843 105 67.5C105 59.2157 98.2843 52.5 90 52.5C89.7729 52.5 89.5472 52.5051 89.3228 52.5152C87.4366 41.5139 77.9132 33.3333 66.6667 33.3333C53.0406 33.3333 42 44.3739 42 58C42 71.6261 53.0406 82.6667 66.6667 82.6667" fill="url(#cloudGradient)" opacity="0.8" />
              <path d="M60 90C60 90 60 60 60 45M60 45L45 60M60 45L75 60" stroke="#C9F9FF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="drop-text">Drop your content here or</p>
          <div className="upload-buttons">
            <label className="upload-button">
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.3334 5.33333L8.00002 2L4.66669 5.33333" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V10" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload files
            </label>
            <label className="upload-button">
              <input 
                type="file" 
                webkitdirectory="true" 
                directory="true" 
                multiple 
                onChange={handleFolderUpload} 
                style={{ display: 'none' }} 
              />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6667 7.33333V12C14.6667 12.3536 14.5262 12.6928 14.2762 12.9428C14.0261 13.1929 13.687 13.3333 13.3334 13.3333H2.66671C2.31309 13.3333 1.97395 13.1929 1.7239 12.9428C1.47385 12.6928 1.33337 12.3536 1.33337 12V4C1.33337 3.64638 1.47385 3.30724 1.7239 3.05719C1.97395 2.80714 2.31309 2.66667 2.66671 2.66667H6.00004L7.33337 4.66667H13.3334C13.687 4.66667 14.0261 4.80714 14.2762 5.05719C14.5262 5.30724 14.6667 5.64638 14.6667 6V7.33333Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload folder
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assets;
