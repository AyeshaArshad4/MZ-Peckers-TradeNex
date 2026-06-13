'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { authenticate }     = require('../middleware/auth.middleware');
const { validate }         = require('../middleware/validate.middleware');
const { authLimiter }      = require('../middleware/rateLimiter');
const {
  registerSchema, loginSchema, refreshSchema, changePasswordSchema,
} = require('../validators/auth.validators');

router.post('/register',         authLimiter, validate(registerSchema),       ctrl.register);
router.post('/login',            authLimiter, validate(loginSchema),          ctrl.login);
router.post('/refresh',                       validate(refreshSchema),         ctrl.refresh);
router.post('/logout',                                                         ctrl.logout);
router.get( '/me',               authenticate,                                ctrl.me);
router.put( '/change-password',  authenticate, validate(changePasswordSchema), ctrl.changePassword);

module.exports = router;