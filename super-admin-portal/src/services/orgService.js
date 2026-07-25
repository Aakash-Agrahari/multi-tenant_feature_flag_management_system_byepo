import api from './api.js';

export const createOrganization = (payload) => api.post('/organizations', payload).then((r) => r.data);
export const listOrganizations = () => api.get('/organizations').then((r) => r.data);
export const getOrganization = (id) => api.get(`/organizations/${id}`).then((r) => r.data);
export const getOrganizationStats = (id) => api.get(`/organizations/${id}/stats`).then((r) => r.data);
export const getDashboardStats = () => api.get('/stats/dashboard').then((r) => r.data);
export const createOrgAdmin = (orgId, payload) => api.post(`/organizations/${orgId}/admins`, payload).then((r) => r.data);
export const listOrgAdmins = (orgId) => api.get(`/organizations/${orgId}/admins`).then((r) => r.data);
