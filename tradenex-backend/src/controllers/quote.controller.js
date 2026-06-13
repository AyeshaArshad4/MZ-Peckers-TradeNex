'use strict';
const quoteService     = require('../services/quote.service');
const { success, created, notFound } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.create = asyncHandler(async (req, res) => {
  const quote = await quoteService.createQuote(req.user.userId, req.body);
  created(res, quote, 'Quote request submitted');
});

exports.myQuotes = asyncHandler(async (req, res) => {
  const quotes = await quoteService.getUserQuotes(req.user.userId, req.query.page, req.query.limit);
  success(res, quotes);
});

exports.myQuoteById = asyncHandler(async (req, res) => {
  const quote = await quoteService.getQuoteById(+req.params.id, req.user.userId);
  if (!quote) return notFound(res, 'Quote not found');
  success(res, quote);
});

exports.adminGetAll = asyncHandler(async (req, res) => {
  const quotes = await quoteService.getAllQuotes(req.query);
  success(res, quotes);
});

exports.adminGetById = asyncHandler(async (req, res) => {
  const quote = await quoteService.getQuoteById(+req.params.id);
  if (!quote) return notFound(res, 'Quote not found');
  success(res, quote);
});

exports.respond = asyncHandler(async (req, res) => {
  const quote = await quoteService.respondToQuote(+req.params.id, req.user.userId, req.body);
  success(res, quote, 'Quote response sent');
});

exports.accept = asyncHandler(async (req, res) => {
  const quote = await quoteService.acceptQuote(+req.params.id, req.user.userId);
  success(res, quote, 'Quote accepted — order created');
});

exports.reject = asyncHandler(async (req, res) => {
  await quoteService.rejectQuote(+req.params.id, req.user.userId);
  success(res, null, 'Quote rejected');
});