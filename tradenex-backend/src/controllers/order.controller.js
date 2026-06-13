'use strict';
const orderService     = require('../services/order.service');
const { success, created, notFound, paginated } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.place = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user.userId, req.body.shippingAddress, req.body.notes);
  created(res, order, 'Order placed successfully');
});

exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.userId, req.query.page, req.query.limit);
  success(res, orders);
});

exports.myOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(+req.params.id, req.user.userId);
  if (!order) return notFound(res, 'Order not found');
  success(res, order);
});

exports.adminGetAll = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  success(res, result);
});

exports.adminGetById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(+req.params.id);
  if (!order) return notFound(res, 'Order not found');
  success(res, order);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(+req.params.id, req.body.status, req.user.userId, req.body.notes);
  success(res, order, 'Order status updated');
});

exports.updatePayment = asyncHandler(async (req, res) => {
  const order = await orderService.updatePaymentStatus(+req.params.id, req.body.paymentStatus);
  success(res, order, 'Payment status updated');
});

exports.requestCancel = asyncHandler(async (req, res) => {
  await orderService.requestCancellation(+req.params.id, req.user.userId, req.body.reason);
  success(res, null, 'Cancellation request submitted');
});

exports.decideCancellation = asyncHandler(async (req, res) => {
  const order = await orderService.decideCancellation(+req.params.id, req.body.decision, req.user.userId);
  success(res, order, `Cancellation ${req.body.decision.toLowerCase()}`);
});