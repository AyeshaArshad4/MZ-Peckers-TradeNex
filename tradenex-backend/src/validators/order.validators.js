'use strict';
const Joi = require('joi');

const placeOrderSchema = Joi.object({
  shippingAddress: Joi.string().max(500).optional().allow('', null),
  notes:           Joi.string().max(500).optional().allow('', null),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('Pending','Confirmed','Processed','Shipped','Delivered','Cancelled').required(),
  notes:  Joi.string().max(255).optional().allow('', null),
});

const cancelSchema = Joi.object({
  reason: Joi.string().max(255).optional().allow('', null),
});

const orderQuerySchema = Joi.object({
  status:  Joi.string().valid('Pending','Confirmed','Processed','Shipped','Delivered','Cancelled').optional(),
  payment: Joi.string().valid('Unpaid','Paid').optional(),
  userId:  Joi.number().integer().positive().optional(),
  page:    Joi.number().integer().min(1).default(1),
  limit:   Joi.number().integer().min(1).max(100).default(10),
});

module.exports = { placeOrderSchema, updateStatusSchema, cancelSchema, orderQuerySchema };