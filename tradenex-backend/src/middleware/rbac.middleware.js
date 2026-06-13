'use strict';

const authorize = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(403).json({ success: false, message: 'Not authenticated' });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not allowed here` });
  next();
};

const requireApproved = (req, res, next) => {
  if (req.user?.role === 'Admin') return next();
  if (req.user?.approvalStatus !== 'Approved')
    return res.status(403).json({ success: false, message: 'Your account is pending admin approval' });
  next();
};

const ownerOrAdmin = (paramName = 'id') => (req, res, next) => {
  if (!req.user)
    return res.status(403).json({ success: false, message: 'Forbidden' });
  const resourceId = parseInt(req.params[paramName]);
  if (req.user.role === 'Admin' || req.user.userId === resourceId) return next();
  return res.status(403).json({ success: false, message: 'You can only access your own resources' });
};

module.exports = { authorize, requireApproved, ownerOrAdmin };