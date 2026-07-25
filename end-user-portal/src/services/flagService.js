import api from './api.js';

export const evaluateAllFlags = () => api.get('/flags/evaluate').then((r) => r.data);
export const evaluateFlag = (key) => api.get(`/flags/evaluate/${key}`).then((r) => r.data);
