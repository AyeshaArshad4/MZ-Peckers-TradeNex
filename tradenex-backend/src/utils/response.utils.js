'use strict';

const success = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Created successfully') =>
  res.status(201).json({ success: true, message, data });

const error = (res, message = 'An error occurred', statusCode = 400, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

const notFound = (res, message = 'Resource not found') =>
  res.status(404).json({ success: false, message });

const unauthorized = (res, message = 'Unauthorized') =>
  res.status(401).json({ success: false, message });

const forbidden = (res, message = 'Forbidden') =>
  res.status(403).json({ success: false, message });

const paginated = (res, data, meta, message = 'Success') =>
  res.status(200).json({ success: true, message, data, pagination: meta });

module.exports = { success, created, error, notFound, unauthorized, forbidden, paginated };