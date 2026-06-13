'use strict';
const userService      = require('../services/user.service');
const { success }      = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  success(res, result, 'Users fetched');
});

exports.getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(+req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  success(res, user);
});

exports.approve = asyncHandler(async (req, res) => {
  const user = await userService.approveUser(+req.params.id);
  success(res, user, 'User approved');
});

exports.reject = asyncHandler(async (req, res) => {
  const user = await userService.rejectUser(+req.params.id, req.body.reason);
  success(res, user, 'User rejected');
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.userId, req.body);
  success(res, user, 'Profile updated');
});