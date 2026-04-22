import { apiClient } from './apiClient';

export const getStudents = () => apiClient('/students');
