'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/query.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize, requireApproved } = require('../middleware/rbac.middleware');

router.post('/',            authenticate, authorize('Customer'), requireApproved, ctrl.create);
router.get( '/my',          authenticate, authorize('Customer'), ctrl.myQueries);
router.get( '/admin',       authenticate, authorize('Admin'), ctrl.adminGetAll);
router.post('/admin/:id/respond', authenticate, authorize('Admin'), ctrl.respond);

module.exports = router;