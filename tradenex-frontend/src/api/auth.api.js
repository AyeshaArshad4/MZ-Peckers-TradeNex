import api from './axios';
export const loginApi        = (data)  => api.post('/auth/login', data);
export const registerApi     = (data)  => api.post('/auth/register', data);
export const refreshApi      = (data)  => api.post('/auth/refresh', data);
export const logoutApi       = (data)  => api.post('/auth/logout', data);
export const getMeApi        = ()      => api.get('/auth/me');
export const changePasswordApi = (data) => api.put('/auth/change-password', data);