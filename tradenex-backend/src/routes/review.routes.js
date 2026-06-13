'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize, requireApproved } = require('../middleware/rbac.middleware');

router.post('/:productId',          authenticate, authorize('Customer'), requireApproved, ctrl.create);
router.get( '/product/:productId',  authenticate, ctrl.getForProduct);
router.get( '/admin/pending',       authenticate, authorize('Admin'), ctrl.getPending);
router.patch('/admin/:id/approve',  authenticate, authorize('Admin'), ctrl.approve);
router.delete('/admin/:id',         authenticate, authorize('Admin'), ctrl.remove);

module.exports = router;