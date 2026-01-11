import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileService, formatFileSize, copyToClipboard } from '../services/api';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/json'
  ];

  const validateFile = (file) => {
    if (!file) {
      setError('Please select a file');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only images, documents, and archives are allowed.');
      return false;
    }

    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileSelect = (file) => {
    setError(null);
    setUploadResult(null);
    setEmailSent(false);
    
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Create a custom axios instance to track upload progress
      const response = await fileService.uploadFile(formData);
      
      if (response.success) {
        setUploadResult(response.data.file);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleShareLink = async (shareId) => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      alert('Share link copied to clipboard!');
    } else {
      // Fallback: show the link in an alert
      prompt('Share link:', shareUrl);
    }
  };

  const handleEmailShare = async () => {
    if (!shareEmail) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(shareEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);
    setError(null);

    try {
      const response = await fileService.shareFileByEmail(uploadResult.shareId, shareEmail);
      
      if (response.success) {
        setEmailSent(true);
        setShareEmail('');
      } else {
        throw new Error(response.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email share error:', error);
      setError(error.response?.data?.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) return '📦';
    if (mimetype.includes('text')) return '📃';
    return '📎';
  };

  return (
    <div className="file-upload">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Upload File</h1>
          <p>Share your files with others easily</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`upload-area ${isDragging ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={ALLOWED_TYPES.join(',')}
            style={{ display: 'none' }}
          />
          
          <div className="upload-icon">📤</div>
          
          {selectedFile ? (
            <div className="selected-file">
              <div className="file-preview">
                <span className="file-icon-large">
                  {getFileIcon(selectedFile.type)}
                </span>
                <div className="file-details">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="btn btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <h3>Drag & drop your file here</h3>
              <p>or click to browse</p>
              <small>
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}<br />
                Allowed types: Images, Documents, Archives
              </small>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {selectedFile && (
          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn btn-primary btn-block"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="upload-result">
            <div className="alert alert-success">
              <h3>✅ File uploaded successfully!</h3>
              <div className="file-info-result">
                <div className="result-file-item">
                  <span className="file-icon">
                    {getFileIcon(uploadResult.mimetype)}
                  </span>
                  <div className="file-details">
                    <div className="file-name">{uploadResult.originalName}</div>
                    <div className="file-meta">
                      {formatFileSize(uploadResult.size)} • 
                      Uploaded {new Date(uploadResult.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="share-section">
                <h4>Share your file:</h4>
                <div className="share-link-container">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/share/${uploadResult.shareId}`}
                    className="form-control"
                  />
                  <button
                    onClick={() => handleShareLink(uploadResult.shareId)}
                    className="btn btn-secondary"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>

              {/* Email Share Section */}
              <div className="email-share-section">
                <h4>📧 Or share via email:</h4>
                {emailSent ? (
                  <div className="email-success">
                    <div className="success-message">
                      <span className="success-icon">✅</span>
                      <p>Email sent successfully! The recipient will receive a download link.</p>
                    </div>
                  </div>
                ) : (
                  <div className="email-share-form">
                    <div className="email-input-group">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter recipient's email address"
                        className="form-control"
                        disabled={isSendingEmail}
                      />
                      <button
                        onClick={handleEmailShare}
                        disabled={isSendingEmail || !shareEmail}
                        className="btn btn-primary"
                      >
                        {isSendingEmail ? 'Sending...' : '📧 Send Email'}
                      </button>
                    </div>
                    <small className="email-help">
                      The recipient will receive an email with a secure download link to your file.
                    </small>
                  </div>
                )}
              </div>

              <div className="result-actions">
                <button
                  onClick={() => navigate('/my-files')}
                  className="btn btn-secondary"
                >
                  View My Files
                </button>
                <button
                  onClick={() => {
                    setUploadResult(null);
                    setSelectedFile(null);
                    setEmailSent(false);
                    setShareEmail('');
                  }}
                  className="btn btn-primary"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
