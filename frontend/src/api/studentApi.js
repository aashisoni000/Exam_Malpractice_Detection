import { apiClient } from './apiClient';

export const getStudents = () => apiClient('/students');
export const getStudentDashboard = (studentId) => apiClient(`/students/dashboard/${studentId}`);
