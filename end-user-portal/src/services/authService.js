import api from './api.js';

export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
