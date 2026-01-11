import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fileService, formatFileSize } from '../services/api';

const SharedFile = () => {
  const { shareId } = useParams();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFileInfo();
  }, [shareId]);

  const fetchFileInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fileService.getSharedFileInfo(shareId);
      
      if (response.success) {
        setFileInfo(response.data);
      } else {
        throw new Error(response.message || 'File not found');
      }
    } catch (error) {
      console.error('Error fetching file info:', error);
      setError(error.response?.data?.message || 'File not found or has expired');
    } finally {
      setLoading(false);
    }
  };

const handleDownload = () => {
  window.location.href = `http://localhost:5000/api/files/download/${shareId}`;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading file information...</p>
      </div>
    );
  }

  if (error || !fileInfo) {
    return (
      <div className="shared-file-error">
        <div className="card">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h1>File Not Found</h1>
            <p>{error || 'The file you are looking for does not exist or has expired.'}</p>
            <Link to="/" className="btn btn-primary">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-file">
      <div className="card">
        <div className="file-preview">
          <div className="file-icon-large">
            {getFileIcon(fileInfo.mimetype)}
          </div>
          <div className="file-details">
            <h1 className="file-name">{fileInfo.originalName}</h1>
            <div className="file-meta">
              <span className="file-size">{formatFileSize(fileInfo.size)}</span>
              <span className="separator">•</span>
              <span className="file-type">{fileInfo.mimetype}</span>
            </div>
          </div>
        </div>

        {isExpired(fileInfo.expiresAt) && (
          <div className="alert alert-error">
            ⚠️ This file has expired and is no longer available for download.
          </div>
        )}

        <div className="file-info-grid">
          <div className="info-item">
            <label>Uploaded by:</label>
            <span>{fileInfo.uploadedBy?.username || 'Anonymous'}</span>
          </div>
          <div className="info-item">
            <label>Upload date:</label>
            <span>{formatDate(fileInfo.createdAt)}</span>
          </div>
          <div className="info-item">
            <label>Downloads:</label>
            <span>{fileInfo.downloadCount}</span>
          </div>
          <div className="info-item">
            <label>Expires:</label>
            <span>{formatDate(fileInfo.expiresAt)}</span>
          </div>
        </div>

        <div className="download-section">
          <button
            onClick={handleDownload}
            disabled={downloading || isExpired(fileInfo.expiresAt)}
            className="btn btn-primary btn-large btn-block"
          >
            {downloading ? 'Downloading...' : '📥 Download File'}
          </button>
          
          {isExpired(fileInfo.expiresAt) && (
            <p className="expired-message">
              This file has expired and cannot be downloaded.
            </p>
          )}
        </div>

        <div className="share-section">
          <h3>Share this file</h3>
          <div className="share-link-container">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="form-control"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="btn btn-secondary"
            >
              📋 Copy Link
            </button>
          </div>
        </div>

        <div className="action-section">
          <Link to="/" className="btn btn-secondary">
            🏠 Go to Homepage
          </Link>
          <Link to="/register" className="btn btn-primary">
            🚀 Start Sharing Files
          </Link>
        </div>
      </div>

      <style jsx>{`
        .shared-file {
          max-width: 600px;
          margin: 0 auto;
        }

        .file-preview {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px solid #eee;
        }

        .file-icon-large {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .file-name {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
          word-break: break-word;
        }

        .file-meta {
          color: #666;
          font-size: 14px;
        }

        .separator {
          margin: 0 8px;
        }

        .file-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item label {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .info-item span {
          color: #666;
        }

        .download-section {
          margin-bottom: 30px;
        }

        .btn-large {
          padding: 16px 24px;
          font-size: 18px;
        }

        .expired-message {
          text-align: center;
          color: #e74c3c;
          margin-top: 10px;
          font-size: 14px;
        }

        .share-section {
          margin-bottom: 30px;
        }

        .share-section h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .share-link-container {
          display: flex;
          gap: 10px;
        }

        .share-link-container .form-control {
          flex: 1;
        }

        .action-section {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .shared-file-error {
          max-width: 500px;
          margin: 0 auto;
        }

        .error-content {
          text-align: center;
          padding: 40px 20px;
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .error-content h1 {
          color: #333;
          margin-bottom: 15px;
        }

        .error-content p {
          color: #666;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .file-info-grid {
            grid-template-columns: 1fr;
          }

          .share-link-container {
            flex-direction: column;
          }

          .action-section {
            flex-direction: column;
          }

          .action-section .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SharedFile;
