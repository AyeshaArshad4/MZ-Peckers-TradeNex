'use strict';
const cartService      = require('../services/cart.service');
const { success }      = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.userId);
  success(res, cart);
});

exports.addOrUpdate = asyncHandler(async (req, res) => {
  const { variantId, quantity } = req.body;
  const cart = await cartService.addOrUpdateItem(req.user.userId, +variantId, +quantity);
  success(res, cart, 'Cart updated');
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.userId, +req.params.itemId);
  success(res, cart, 'Item removed');
});

exports.clearCart = asyncHandler(async (req, res) => {
  const { cartId } = await cartService.getCart(req.user.userId);
  await cartService.clearCart(cartId);
  success(res, null, 'Cart cleared');
});