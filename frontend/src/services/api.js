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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
      } catch (_) {}
    }
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

// ── Exam API ──────────────────────────────────────────────────────────────────
export const examAPI = {
  /** Admin: create a new exam */
  create: (subject_name, exam_date, duration_minutes) =>
    api.post('/exams', { subject_name, exam_date, duration_minutes }),

  /** Get all exams */
  getAll: () => api.get('/exams'),

  /** Get exams available to a student */
  getForStudent: (student_id) => api.get(`/exams/student/${student_id}`),

  /** Start an exam attempt */
  start: (student_id, exam_id) =>
    api.post('/exams/start', { student_id, exam_id }),

  /** Submit exam answers */
  submit: (attempt_id, answers_text) =>
    api.post('/exams/submit', { attempt_id, answers_text }),

  /** Log a suspicion event (tab switch, copy-paste, etc.) */
  logEvent: (attempt_id, reason, severity = 'Medium') =>
    api.post('/exams/log-event', { attempt_id, reason, severity }),
};
// ──────────────────────────────────────────────────────────────────────────────

// Future modules:
// export const reportAPI  = { ... };
// export const ipLogAPI   = { ... };

export default api;
