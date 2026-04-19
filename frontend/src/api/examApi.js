import { apiClient } from './apiClient';

export const getExams = () => {
  return apiClient('/exams');
};

export const createExam = (examData) => {
  return apiClient('/exams', {
    method: 'POST',
    body: examData,
  });
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
