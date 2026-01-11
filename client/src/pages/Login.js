import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewUserWarning, setShowNewUserWarning] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);

  const { login, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load saved credentials on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedCredentials');
    if (saved) {
      const credentials = JSON.parse(saved);
      setSavedCredentials(credentials);
      setFormData({
        email: credentials.email,
        password: credentials.password
      });
    }
  }, []);

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Hide warning when user starts typing
    if (showNewUserWarning) {
      setShowNewUserWarning(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Check if error indicates user doesn't exist
        if (result.message.includes('User not found') || result.message.includes('Invalid credentials')) {
          setShowNewUserWarning(true);
        }
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSavedCredentials = () => {
    if (savedCredentials) {
      setFormData({
        email: savedCredentials.email,
        password: savedCredentials.password
      });
      setShowNewUserWarning(false);
    }
  };

  const handleRemoveSavedCredentials = () => {
    localStorage.removeItem('savedCredentials');
    setSavedCredentials(null);
    setFormData({ email: '', password: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* New User Warning */}
        {showNewUserWarning && (
          <div className="warning-message">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h4>New to FileShare?</h4>
              <p>It looks like you don't have an account yet. Sign up now to get started!</p>
              <div className="warning-actions">
                <button 
                  onClick={() => navigate('/register')}
                  className="btn btn-primary"
                >
                  Sign Up Now
                </button>
                <button 
                  onClick={() => setShowNewUserWarning(false)}
                  className="btn btn-secondary"
                >
                  I have an account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Credentials Notice */}
        {savedCredentials && (
          <div className="saved-credentials-notice">
            <div className="saved-icon">💾</div>
            <div className="saved-content">
              <p>Saved credentials found for {savedCredentials.email}</p>
              <div className="saved-actions">
                <button 
                  onClick={handleUseSavedCredentials}
                  className="btn btn-sm btn-primary"
                >
                  Use Saved
                </button>
                <button 
                  onClick={handleRemoveSavedCredentials}
                  className="btn btn-sm btn-secondary"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {error && !showNewUserWarning && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {errors.general && !showNewUserWarning && (
          <div className="alert alert-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
