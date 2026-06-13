import api from './axios';
export const getProductsApi    = (params) => api.get('/products', { params });
export const getProductApi     = (id)     => api.get(`/products/${id}`);
export const getCategoriesApi  = ()       => api.get('/products/categories');
export const createProductApi  = (data)   => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProductApi  = (id, d)  => api.put(`/products/${id}`, d);
export const deleteProductApi  = (id)     => api.delete(`/products/${id}`);