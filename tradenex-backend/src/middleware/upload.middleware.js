'use strict';
const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');
const { error } = require('../utils/response.utils');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_PATH || './uploads'),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
});

const imageFilter = (req, file, cb) => {
  const okExt  = /\.(jpg|jpeg|png|webp)$/i.test(path.extname(file.originalname));
  const okMime = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
  okExt && okMime ? cb(null, true) : cb(new Error('Only JPEG, PNG, and WebP images allowed'));
};

const maxBytes = (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: maxBytes } });

// Wraps multer to catch its errors and return proper JSON
const handleProductImageUpload = (req, res, next) => {
  upload.array('images', 6)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE')  return error(res, `Max file size is ${process.env.MAX_FILE_SIZE_MB || 5}MB`, 400);
      if (err.code === 'LIMIT_FILE_COUNT') return error(res, 'Max 6 images per product', 400);
    }
    return error(res, err.message, 400);
  });
};

module.exports = { handleProductImageUpload };