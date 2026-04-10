// services/api.js
// Centralized Axios instance.
// All API calls should go through this instance.
// Add interceptors here for auth tokens, error handling, etc.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// TODO: Attach JWT token to every request when auth is implemented.
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Handles global errors (401 redirect, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Clear local storage and redirect to login when session expires
      // localStorage.removeItem('user');
      // window.location.href = '/login';
      console.warn('[API] Unauthorized — redirect to login');
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password, role) =>
    api.post('/login', { email, password, role }),
};

// ── Future API Modules (add as features are built) ───────────────────────────
// export const studentAPI = { ... };
// export const examAPI    = { ... };
// export const reportAPI  = { ... };
// export const ipLogAPI   = { ... };
// ──────────────────────────────────────────────────────────────────────────────

export default api;
