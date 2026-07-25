import api from './api.js';

export const createEndUser = (payload) => api.post('/users/end-users', payload).then((r) => r.data);
export const listEndUsers = () => api.get('/users/end-users').then((r) => r.data);
