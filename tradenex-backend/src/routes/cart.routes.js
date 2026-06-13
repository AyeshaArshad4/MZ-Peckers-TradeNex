'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/cart.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { authorize, requireApproved } = require('../middleware/rbac.middleware');

const customerAuth = [authenticate, authorize('Customer'), requireApproved];

router.get(   '/',             ...customerAuth, ctrl.getCart);
router.post(  '/items',        ...customerAuth, ctrl.addOrUpdate);
router.put(   '/items/:itemId',...customerAuth, ctrl.addOrUpdate);
router.delete('/items/:itemId',...customerAuth, ctrl.removeItem);
router.delete('/',             ...customerAuth, ctrl.clearCart);

module.exports = router;