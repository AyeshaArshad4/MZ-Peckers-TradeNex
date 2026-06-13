'use strict';
const reviewService    = require('../services/review.service');
const { success, created } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.userId, +req.params.productId, req.body);
  created(res, review, 'Review submitted — pending approval');
});

exports.getForProduct = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'Admin';
  const reviews = await reviewService.getProductReviews(+req.params.productId, !isAdmin);
  success(res, reviews);
});

exports.getPending = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getPendingReviews();
  success(res, reviews);
});

exports.approve = asyncHandler(async (req, res) => {
  await reviewService.approveReview(+req.params.id, req.user.userId);
  success(res, null, 'Review approved');
});

exports.remove = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(+req.params.id);
  success(res, null, 'Review deleted');
});