import api from '../services/api';
import { apiClient } from './apiClient';

export const getExams = () => {
  return apiClient('/exams');
};

export const createExam = (data) => {
  return api.post("/exams", data);
};

export const startExam = (attemptData) => {
  return apiClient('/exams/start', {
    method: 'POST',
    body: attemptData,
  });
};

export const submitExam = (submissionData) => {
  return apiClient('/exams/submit', {
    method: 'POST',
    body: submissionData,
  });
};

export const startExamSession = (data) => apiClient('/exam/start', {
  method: 'POST',
  body: data,
});

export const endExamSession = (data) => apiClient('/exam/end', {
  method: 'POST',
  body: data,
});

export const logIpDuringExam = (data) => apiClient('/exam/log-ip', {
  method: 'POST',
  body: data,
});

export const logExamEvent = (data) => apiClient('/exam/log-event', {
  method: 'POST',
  body: data,
});

export const assignStudents = (data) => apiClient('/exams/assign', {
  method: 'POST',
  body: data,
});



