'use strict';
const Joi = require('joi');

const createQuoteSchema = Joi.object({
  customerNotes: Joi.string().max(1000).optional().allow('', null),
  targetPrice:   Joi.number().min(0).optional().allow(null),
  items: Joi.array().items(Joi.object({
    variantId:          Joi.number().integer().positive().required(),
    quantity:           Joi.number().integer().min(1).required(),
    requestedUnitPrice: Joi.number().min(0).optional().allow(null),
  })).min(1).required(),
});

const respondQuoteSchema = Joi.object({
  adminQuotedTotal: Joi.number().min(0).required(),
  adminNotes:       Joi.string().max(1000).optional().allow('', null),
});

module.exports = { createQuoteSchema, respondQuoteSchema };