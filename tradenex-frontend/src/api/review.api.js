import api from './axios';
export const createReviewApi    = (pid, d) => api.post(`/reviews/${pid}`, d);
export const getProductReviewsApi = (pid)  => api.get(`/reviews/product/${pid}`);
export const getPendingReviewsApi = ()     => api.get('/reviews/admin/pending');
export const approveReviewApi   = (id)    => api.patch(`/reviews/admin/${id}/approve`);
export const deleteReviewApi    = (id)    => api.delete(`/reviews/admin/${id}`);