import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Upload, Save and easily <span className="highlight">Share your files</span> in one place
            </h1>
            <p className="hero-subtitle">
              Experience the future of file sharing with our secure, fast, and intuitive platform. 
              Share your memories, documents, and projects with anyone, anywhere.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large hero-btn">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large hero-btn">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-elements">
              <div className="file-icon file-1">📁</div>
              <div className="file-icon file-2">📄</div>
              <div className="file-icon file-3">🖼️</div>
              <div className="file-icon file-4">📊</div>
              <div className="file-icon file-5">🎵</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose FileShare?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your files are protected with enterprise-grade security and encryption.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Upload and download files instantly with our optimized infrastructure.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Access</h3>
              <p>Share your files with anyone, anywhere in the world with a simple link.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access and share files seamlessly across all your devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10M+</div>
              <div className="stat-label">Files Shared</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">150+</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Sharing?</h2>
            <p>Join thousands of users who trust FileShare for their file sharing needs.</p>
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
