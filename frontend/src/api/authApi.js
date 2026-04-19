import { apiClient } from './apiClient';

export const loginApi = (credentials) => {
  return apiClient('/auth/login', {
    method: 'POST',
    body: credentials,
  });
};
