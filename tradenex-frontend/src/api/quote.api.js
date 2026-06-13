import api from './axios';
export const createQuoteApi    = (data)   => api.post('/quotes', data);
export const getMyQuotesApi    = (params) => api.get('/quotes/my', { params });
export const getMyQuoteApi     = (id)     => api.get(`/quotes/my/${id}`);
export const acceptQuoteApi    = (id)     => api.post(`/quotes/my/${id}/accept`);
export const rejectQuoteApi    = (id)     => api.post(`/quotes/my/${id}/reject`);
export const adminGetQuotesApi = (params) => api.get('/quotes/admin', { params });
export const adminGetQuoteApi  = (id)     => api.get(`/quotes/admin/${id}`);
export const respondQuoteApi   = (id, d)  => api.patch(`/quotes/admin/${id}/respond`, d);