'use strict';
const router = require('express').Router();

router.use('/auth',      require('./auth.routes'));
router.use('/users',     require('./user.routes'));
router.use('/products',  require('./product.routes'));
router.use('/cart',      require('./cart.routes'));
router.use('/orders',    require('./order.routes'));
router.use('/quotes',    require('./quote.routes'));
router.use('/reviews',   require('./review.routes'));
router.use('/queries',   require('./query.routes'));
router.use('/analytics', require('./analytics.routes'));

module.exports = router;