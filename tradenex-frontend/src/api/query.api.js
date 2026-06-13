import api from './axios';
export const createQueryApi   = (data)   => api.post('/queries', data);
export const getMyQueriesApi  = ()       => api.get('/queries/my');
export const adminGetQueriesApi = (p)    => api.get('/queries/admin', { params: p });
export const respondQueryApi  = (id, d)  => api.post(`/queries/admin/${id}/respond`, d);