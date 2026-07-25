import api from './api.js';

export const listFlags = (params) => api.get('/flags', { params }).then((r) => r.data);
export const getFlag = (id) => api.get(`/flags/${id}`).then((r) => r.data);
export const createFlag = (payload) => api.post('/flags', payload).then((r) => r.data);
export const updateFlag = (id, payload) => api.patch(`/flags/${id}`, payload).then((r) => r.data);
export const toggleFlag = (id) => api.patch(`/flags/${id}/toggle`).then((r) => r.data);
export const deleteFlag = (id) => api.delete(`/flags/${id}`).then((r) => r.data);
