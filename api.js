import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Extract error message cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected network error occurred. Please try again.';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (typeof error.response?.data === 'string' && (error.response.data.includes('ECONNREFUSED') || error.response.data.includes('Proxy error'))) {
      message = 'Unable to reach backend server on port 5000. Please ensure the Express backend is started.';
    } else if (error.response?.status === 500 && !error.response?.data?.message) {
      message = 'Unable to reach backend server on port 5000. Please ensure the Express backend is started.';
    } else if (error.message) {
      message = error.message;
    }

    // If unauthorized / token expired, clear invalid session
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('campusflow_token');
      localStorage.removeItem('campusflow_user');
      // Dispatch a storage event or redirect if needed
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
