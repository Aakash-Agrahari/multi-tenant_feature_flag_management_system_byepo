import api from './api.js';

export const superAdminLogin = (payload) => api.post('/auth/super-admin/login', payload).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
