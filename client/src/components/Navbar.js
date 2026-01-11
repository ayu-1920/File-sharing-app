import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Section */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            FileShare
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-menu">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/upload" 
                className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}
              >
                Upload
              </Link>
              <Link 
                to="/my-files" 
                className={`nav-link ${location.pathname === '/my-files' ? 'active' : ''}`}
              >
                My Files
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* User Section */}
        {user && (
          <div className="navbar-user">
            <span className="user-name">👤 {user.username}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
<button 
  className="mobile-menu-btn" 
  onClick={toggleMobileMenu}
>
  ☰
</button>

      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link 
            to="/" 
            className="nav-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/upload" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Upload
              </Link>
              <Link 
                to="/my-files" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Files
              </Link>
              <div className="mobile-user-section">
                <span className="user-name">👤 {user.username}</span>
                <button 
                  onClick={handleLogout} 
                  className="btn-logout"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
