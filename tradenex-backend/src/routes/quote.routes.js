'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/quote.controller');
const { authenticate }       = require('../middleware/auth.middleware');
const { authorize, requireApproved } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createQuoteSchema, respondQuoteSchema } = require('../validators/quote.validators');

// Customer
router.post('/',           authenticate, authorize('Customer'), requireApproved, validate(createQuoteSchema), ctrl.create);
router.get( '/my',         authenticate, authorize('Customer'), ctrl.myQuotes);
router.get( '/my/:id',     authenticate, authorize('Customer'), ctrl.myQuoteById);
router.post('/my/:id/accept', authenticate, authorize('Customer'), ctrl.accept);
router.post('/my/:id/reject', authenticate, authorize('Customer'), ctrl.reject);

// Admin
router.get(  '/admin',      authenticate, authorize('Admin'), ctrl.adminGetAll);
router.get(  '/admin/:id',  authenticate, authorize('Admin'), ctrl.adminGetById);
router.patch('/admin/:id/respond', authenticate, authorize('Admin'), validate(respondQuoteSchema), ctrl.respond);

module.exports = router;