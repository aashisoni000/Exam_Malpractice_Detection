import { apiClient } from './apiClient';

export const getReports = () => {
  return apiClient('/reports');
};
