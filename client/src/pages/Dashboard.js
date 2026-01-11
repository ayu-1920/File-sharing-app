import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileService, formatFileSize } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    totalDownloads: 0
  });
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch file statistics
      const statsResponse = await fileService.getFileStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch recent files (first 5 files)
      const filesResponse = await fileService.getMyFiles(1, 5);
      if (filesResponse.success) {
        setRecentFiles(filesResponse.data.files);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}! 👋</h1>
        <p>Here's an overview of your file sharing activity</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalFiles}</div>
          <div className="stat-label">Total Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatFileSize(stats.totalSize)}</div>
          <div className="stat-label">Total Size</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalDownloads}</div>
          <div className="stat-label">Total Downloads</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <Link to="/upload" className="btn btn-primary">
            📤 Upload New File
          </Link>
          <Link to="/my-files" className="btn btn-secondary">
            📁 View All Files
          </Link>
        </div>
      </div>

      {/* Recent Files */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Files</h2>
          {recentFiles.length > 0 && (
            <Link to="/my-files" className="view-all-link">
              View All
            </Link>
          )}
        </div>
        
        {recentFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No files yet</h3>
            <p>Start by uploading your first file to share it with others.</p>
            <Link to="/upload" className="btn btn-primary">
              Upload Your First File
            </Link>
          </div>
        ) : (
          <ul className="file-list">
            {recentFiles.map((file) => (
              <li key={file._id} className="file-item">
                <div className="file-icon">
                  {getFileIcon(file.mimetype)}
                </div>
                <div className="file-info">
                  <div className="file-name">{file.originalName}</div>
                  <div className="file-meta">
                    {formatFileSize(file.size)} • {formatDate(file.createdAt)} • 
                    {file.downloadCount} downloads
                  </div>
                </div>
                <div className="file-actions">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/share/${file.shareId}`
                      );
                      alert('Share link copied to clipboard!');
                    }}
                    className="btn btn-secondary btn-sm"
                    title="Copy share link"
                  >
                    📋
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
