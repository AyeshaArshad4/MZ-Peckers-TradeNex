import api from './axios';
export const getUsersApi      = (params) => api.get('/users', { params });
export const approveUserApi   = (id)     => api.patch(`/users/${id}/approve`);
export const rejectUserApi    = (id, d)  => api.patch(`/users/${id}/reject`, d);
export const updateProfileApi = (data)   => api.put('/users/profile/me', data);