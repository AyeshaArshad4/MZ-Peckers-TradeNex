'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/order.controller');
const { authenticate }       = require('../middleware/auth.middleware');
const { authorize, requireApproved } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { placeOrderSchema, updateStatusSchema, cancelSchema, orderQuerySchema } = require('../validators/order.validators');

// Customer routes
router.post('/',                         authenticate, authorize('Customer'), requireApproved, validate(placeOrderSchema), ctrl.place);
router.get( '/my',                       authenticate, authorize('Customer'), ctrl.myOrders);
router.get( '/my/:id',                   authenticate, authorize('Customer'), ctrl.myOrderById);
router.post('/my/:id/cancel',            authenticate, authorize('Customer'), validate(cancelSchema), ctrl.requestCancel);

// Admin routes
router.get(  '/admin',                   authenticate, authorize('Admin'), validateQuery(orderQuerySchema), ctrl.adminGetAll);
router.get(  '/admin/:id',               authenticate, authorize('Admin'), ctrl.adminGetById);
router.patch('/admin/:id/status',        authenticate, authorize('Admin'), validate(updateStatusSchema), ctrl.updateStatus);
router.patch('/admin/:id/payment',       authenticate, authorize('Admin'), ctrl.updatePayment);
router.patch('/admin/:id/cancellation',  authenticate, authorize('Admin'), ctrl.decideCancellation);

module.exports = router;