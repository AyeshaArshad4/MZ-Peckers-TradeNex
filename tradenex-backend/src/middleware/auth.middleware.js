'use strict';
const { verifyAccessToken } = require('../utils/jwt.utils');

const authenticate = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired — please refresh' });
    }
    return res.status(401).json({ success: false, message: 'Invalid access token' });
  }
};

module.exports = { authenticate };