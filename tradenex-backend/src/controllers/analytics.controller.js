'use strict';
const analyticsService = require('../services/analytics.service');
const { success }      = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboard();
  success(res, data, 'Dashboard data loaded');
});