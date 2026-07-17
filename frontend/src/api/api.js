import axios from 'axios';

// Backend Base URL
// Reads from .env (VITE_API_URL) so this actually changes per environment
// (local dev vs production) instead of always pointing at localhost.
const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Create Axios Instance
const api = axios.create({
  baseURL: API_URL,

  headers: {
    'Content-Type': 'application/json'
  },

  timeout: 10000
});

// Add JWT Token Automatically
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem(
        'ladli_token'
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// Handle Unauthorized Errors
api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      'API Error:',
      error.response || error
    );

    if (
      error.response &&
      error.response.status === 401
    ) {
      sessionStorage.removeItem('ladli_token');

      sessionStorage.removeItem('ladli_user');

      if (
        window.location.pathname !==
        '/login'
      ) {
        window.location.href =
          '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;