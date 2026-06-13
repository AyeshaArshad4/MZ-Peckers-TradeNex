'use strict';
const authService      = require('../services/auth.service');
const { asyncHandler } = require('../middleware/errorHandler');

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Registered successfully. Awaiting admin approval.', data: user });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, message: 'Login successful', data: result });
});

exports.refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.status(200).json({ success: true, message: 'Token refreshed', data: tokens });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(200).json({ success: true, message: 'Logged out successfully', data: null });
});

exports.me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Current user', data: req.user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.userId, req.body.currentPassword, req.body.newPassword);
  res.status(200).json({ success: true, message: 'Password changed. Please log in again.', data: null });
});