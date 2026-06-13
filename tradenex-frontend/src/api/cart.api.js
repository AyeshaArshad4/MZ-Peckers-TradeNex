import api from './axios';
export const getCartApi      = ()         => api.get('/cart');
export const addToCartApi    = (data)     => api.post('/cart/items', data);
export const updateCartApi   = (id, data) => api.put(`/cart/items/${id}`, data);
export const removeFromCartApi = (id)     => api.delete(`/cart/items/${id}`);
export const clearCartApi    = ()         => api.delete('/cart');