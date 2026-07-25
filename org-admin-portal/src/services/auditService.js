import api from './api.js';

export const listAuditLogs = (params) => api.get('/audit-logs', { params }).then((r) => r.data);
