'use strict';
const productService   = require('../services/product.service');
const { success, created, notFound } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  success(res, result);
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(+req.params.id);
  if (!product) return notFound(res, 'Product not found');
  success(res, product);
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getAllCategories();
  success(res, categories);
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.files);
  created(res, product, 'Product created');
});

exports.update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(+req.params.id, req.body);
  if (!product) return notFound(res, 'Product not found');
  success(res, product, 'Product updated');
});

exports.remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(+req.params.id);
  success(res, null, 'Product deactivated');
});