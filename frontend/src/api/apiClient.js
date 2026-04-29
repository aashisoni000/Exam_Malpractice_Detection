// Base API Client
const API_URL = '/api'; // Using proxy in dev

export const apiClient = async (endpoint, { method = 'GET', body, ...customConfig } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token || token) {
      headers.Authorization = `Bearer ${user.token || token}`;
    }
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: { ...headers, ...customConfig.headers },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};
