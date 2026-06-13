'use strict';
const Joi = require('joi');

const pwd = Joi.string().min(8).max(72)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .messages({ 'string.pattern.base': 'Password must have uppercase, lowercase, and a number' });

const registerSchema = Joi.object({
  username:     Joi.string().alphanum().min(3).max(50).required(),
  email:        Joi.string().email().max(254).required(),
  password:     pwd.required(),
  fullName:     Joi.string().min(2).max(100).required(),
  phone:        Joi.string().min(7).max(20).required(),
  companyName:  Joi.string().max(120).optional().allow('', null),
  customerType: Joi.string().valid('Contractor','ShopOwner','Installer','Other').optional().allow(null),
  country:      Joi.string().max(50).optional().allow('', null),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword:     pwd.required(),
});

module.exports = { registerSchema, loginSchema, refreshSchema, changePasswordSchema };