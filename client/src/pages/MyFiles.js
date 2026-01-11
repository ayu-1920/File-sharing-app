import React, { useState, useEffect } from 'react';
import { fileService, formatFileSize, copyToClipboard } from '../services/api';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [currentPage]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fileService.getMyFiles(currentPage, 10);
      
      if (response.success) {
        setFiles(response.data.files);
        setTotalPages(response.data.pagination.pages);
      } else {
        throw new Error(response.message || 'Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const response = await fileService.deleteFile(fileId);
      
      if (response.success) {
        setFiles(files.filter(file => file._id !== fileId));
        setDeleteConfirm(null);
      } else {
        throw new Error(response.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleShareLink = async (shareId) => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      alert('Share link copied to clipboard!');
    } else {
      // Fallback: show the link in a prompt
      prompt('Share link:', shareUrl);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
        <p>Loading your files...</p>
      </div>
    );
  }

  return (
    <div className="my-files">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">My Files</h1>
          <p>Manage and share your uploaded files</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              onClick={() => setError(null)}
              className="alert-close"
            >
              ×
            </button>
          </div>
        )}

        {files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No files uploaded yet</h3>
            <p>Start uploading files to share them with others.</p>
            <a href="/upload" className="btn btn-primary">
              Upload Your First File
            </a>
          </div>
        ) : (
          <>
            <div className="files-container">
              <ul className="file-list">
                {files.map((file) => (
                  <li key={file._id} className="file-item">
                    <div className="file-icon">
                      {getFileIcon(file.mimetype)}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.originalName}</div>
                      <div className="file-meta">
                        {formatFileSize(file.size)} • 
                        {formatDate(file.createdAt)} • 
                        {file.downloadCount} downloads
                        {isExpired(file.expiresAt) && (
                          <span className="expired-badge">EXPIRED</span>
                        )}
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        onClick={() => handleShareLink(file.shareId)}
                        className="btn btn-secondary btn-sm"
                        title="Copy share link"
                        disabled={isExpired(file.expiresAt)}
                      >
                        📋
                      </button>
                      <a
                        href={`/share/${file.shareId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        title="View file page"
                      >
                        👁️
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(file._id)}
                        className="btn btn-danger btn-sm"
                        title="Delete file"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this file? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .expired-badge {
          background-color: #e74c3c;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: bold;
          margin-left: 8px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          margin-bottom: 20px;
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
        }

        .page-info {
          color: #666;
          font-weight: 500;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default MyFiles;
