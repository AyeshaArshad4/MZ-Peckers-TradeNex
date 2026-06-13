'use strict';
const Joi = require('joi');

// FormData sends booleans as strings "true"/"false"
// This custom validator handles both actual booleans and string booleans
const flexibleBoolean = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid('true', 'false').custom((val) => val === 'true')
).default(false);

// Handles numbers sent as strings from FormData
const flexibleNumber = (min = 0) => Joi.alternatives().try(
  Joi.number().min(min),
  Joi.string().regex(/^\d+(\.\d+)?$/).custom((val) => parseFloat(val))
);

const createProductSchema = Joi.object({
  categoryId:               flexibleNumber(1).required(),
  sku:                      Joi.string().max(50).required(),
  name:                     Joi.string().max(120).required(),
  description:              Joi.string().max(2000).optional().allow('', null),
  specifications:           Joi.string().max(2000).optional().allow('', null),
  basePrice:                flexibleNumber(0).required(),
  stockQty:                 flexibleNumber(0).default(0),
  hasTrademarkBadge:        flexibleBoolean,
  hasVerifiedSupplierLabel: flexibleBoolean,
  variants:                 Joi.string().optional().allow('', null),
});

const updateProductSchema = Joi.object({
  categoryId:               Joi.number().integer().positive(),
  name:                     Joi.string().max(120),
  description:              Joi.string().max(2000).allow('', null),
  specifications:           Joi.string().max(2000).allow('', null),
  basePrice:                Joi.number().min(0),
  stockQty:                 Joi.number().integer().min(0),
  hasTrademarkBadge:        Joi.boolean(),
  hasVerifiedSupplierLabel: Joi.boolean(),
  isActive:                 Joi.boolean(),
}).min(1);

const productQuerySchema = Joi.object({
  search:     Joi.string().max(100).optional().allow(''),
  categoryId: Joi.number().integer().positive().optional(),
  inStock:    Joi.string().valid('true', 'false').optional(),
  page:       Joi.number().integer().min(1).default(1),
  limit:      Joi.number().integer().min(1).max(100).default(12),
});

module.exports = { createProductSchema, updateProductSchema, productQuerySchema };