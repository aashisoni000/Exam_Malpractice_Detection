import { apiClient } from './apiClient';

export const getQuestions = (exam_id) =>
  apiClient(`/questions/${exam_id}`);

export const createQuestion = (data) =>
  apiClient('/questions', { method: 'POST', body: data });

export const getOptions = (question_id) =>
  apiClient(`/questions/${question_id}/options`);

export const createOption = (data) =>
  apiClient('/questions/options', { method: 'POST', body: data });
