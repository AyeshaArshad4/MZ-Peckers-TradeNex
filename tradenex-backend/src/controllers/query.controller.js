'use strict';
const queryService     = require('../services/query.service');
const { success, created } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.create = asyncHandler(async (req, res) => {
  const query = await queryService.createQuery(req.user.userId, req.body.productId || null, req.body.question);
  created(res, query, 'Query submitted');
});

exports.myQueries = asyncHandler(async (req, res) => {
  const queries = await queryService.getUserQueries(req.user.userId);
  success(res, queries);
});

exports.adminGetAll = asyncHandler(async (req, res) => {
  const queries = await queryService.getAllQueries(req.query);
  success(res, queries);
});

exports.respond = asyncHandler(async (req, res) => {
  await queryService.respondToQuery(+req.params.id, req.user.userId, req.body.responseText);
  success(res, null, 'Response sent');
});