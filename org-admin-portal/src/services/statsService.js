import api from './api.js';

export const getDashboardStats = () => api.get('/stats/dashboard').then((r) => r.data);
