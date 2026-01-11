import axios from 'axios';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instances for different endpoints
export const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fileApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to fileApi for public endpoints (optional)
fileApi.interceptors.request.use(
  (config) => {
    // For download endpoints, we don't need auth token
    // But we can add it if needed for other file operations
    const token = localStorage.getItem('token');
    if (token && !config.url.includes('/download/') && !config.url.includes('/share/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add request interceptor to include auth token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authService = {
  login: async (email, password) => {
    const response = await authApi.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await authApi.post('/auth/register', { username, email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await authApi.get('/auth/me');
    return response.data;
  },
};

// File API
export const fileService = {
  uploadFile: async (formData) => {
    const response = await fileApi.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getMyFiles: async (page = 1, limit = 10) => {
    const response = await authApi.get(`/files/my-files?page=${page}&limit=${limit}`);
    return response.data;
  },

  getFileStats: async () => {
    const response = await authApi.get('/files/stats');
    return response.data;
  },

  getRecentFiles: async (limit = 5) => {
    const response = await authApi.get(`/files/recent?limit=${limit}`);
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await authApi.delete(`/files/${fileId}`);
    return response.data;
  },

  getSharedFileInfo: async (shareId) => {
    const response = await fileApi.get(`/files/share/${shareId}`);
    return response.data;
  },

  downloadFile: async (shareId) => {
    const response = await fileApi.get(`/files/download/${shareId}`, {
      responseType: 'blob',
    });
    return response;
  },

  // New email sharing function
  shareFileByEmail: async (shareId, email) => {
    const response = await authApi.post('/files/share-email', { shareId, email });
    return response.data;
  },
};

// Utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimetype) => {
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

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export default {
  authApi,
  fileApi,
  authService,
  fileService,
  formatFileSize,
  getFileIcon,
  copyToClipboard
};
