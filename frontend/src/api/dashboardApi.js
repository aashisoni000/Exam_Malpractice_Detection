import { apiClient } from './apiClient';

export const getDashboardStats = () => {
  return apiClient('/dashboard/stats');
};

export const getDashboardCharts = () => {
  return apiClient('/dashboard/charts');
};

export const getRecentReports = () => {
  return apiClient('/dashboard/recent-reports');
};
