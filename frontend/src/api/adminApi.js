import { apiClient } from './apiClient';

export const getLiveSessions = () => apiClient('/admin/live-sessions');

export const getSessionActivity = (attemptId) => apiClient(`/admin/session-activity/${attemptId}`);

export const getLiveStats = () => apiClient('/admin/live-stats');

export const terminateSession = (attemptId) => apiClient('/admin/terminate-session', {
  method: 'POST',
  body: { attempt_id: attemptId }
});
