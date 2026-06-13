'use strict';
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error(`[${req.method}] ${req.originalUrl} — ${err.message}`, {
    status,
    userId: req.user?.userId || null,
    stack:  err.stack,
  });

  if (err.number === 2627 || err.number === 2601)
    return res.status(409).json({ success: false, message: 'Duplicate value — record already exists' });
  if (err.number === 547)
    return res.status(400).json({ success: false, message: 'Operation violates a database constraint' });

  res.status(status).json({
    success: false,
    message: isProd && status === 500 ? 'Internal server error' : err.message,
  });
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };