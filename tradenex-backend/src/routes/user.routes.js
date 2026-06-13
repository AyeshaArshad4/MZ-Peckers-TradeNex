'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/user.controller');
const { authenticate }     = require('../middleware/auth.middleware');
const { authorize }        = require('../middleware/rbac.middleware');

router.get( '/',              authenticate, authorize('Admin'),              ctrl.getAll);
router.get( '/:id',           authenticate, authorize('Admin'),              ctrl.getById);
router.patch('/:id/approve',  authenticate, authorize('Admin'),              ctrl.approve);
router.patch('/:id/reject',   authenticate, authorize('Admin'),              ctrl.reject);
router.put(  '/profile/me',   authenticate,                                  ctrl.updateProfile);

module.exports = router;