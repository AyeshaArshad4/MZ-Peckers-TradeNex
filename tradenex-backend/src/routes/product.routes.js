'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/product.controller');
const { authenticate }               = require('../middleware/auth.middleware');
const { authorize, requireApproved } = require('../middleware/rbac.middleware');
const { validate, validateQuery }    = require('../middleware/validate.middleware');
const { handleProductImageUpload }   = require('../middleware/upload.middleware');
const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} = require('../validators/product.validators');

// Public-ish (any approved user)
router.get('/',           authenticate, requireApproved, validateQuery(productQuerySchema), ctrl.getAll);
router.get('/categories', authenticate,                                                     ctrl.getCategories);
router.get('/:id',        authenticate, requireApproved,                                   ctrl.getById);

// Admin only
// NOTE: handleProductImageUpload comes BEFORE validate because it parses multipart/form-data
// which populates req.body so Joi can then validate it
router.post('/',
  authenticate,
  authorize('Admin'),
  handleProductImageUpload,       // parses multipart, populates req.body and req.files
  validate(createProductSchema),  // now req.body is available
  ctrl.create
);

router.put('/:id',
  authenticate,
  authorize('Admin'),
  validate(updateProductSchema),
  ctrl.update
);

router.delete('/:id',
  authenticate,
  authorize('Admin'),
  ctrl.remove
);

module.exports = router;