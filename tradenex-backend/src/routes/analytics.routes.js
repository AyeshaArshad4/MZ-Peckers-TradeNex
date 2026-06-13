'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize }    = require('../middleware/rbac.middleware');

router.get('/dashboard', authenticate, authorize('Admin'), ctrl.getDashboard);

module.exports = router;