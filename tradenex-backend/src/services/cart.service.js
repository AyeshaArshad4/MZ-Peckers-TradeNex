'use strict';
const { getPool, sql } = require('../config/db');

const getOrCreateActiveCart = async (userId) => {
  const pool = await getPool();
  let res = await pool.request()
    .input('uid', sql.Int, userId)
    .query("SELECT CartID FROM Carts WHERE UserID=@uid AND Status='Active'");
  if (res.recordset.length) return res.recordset[0].CartID;

  res = await pool.request()
    .input('uid', sql.Int, userId)
    .query("INSERT INTO Carts (UserID) OUTPUT INSERTED.CartID VALUES (@uid)");
  return res.recordset[0].CartID;
};

const getCart = async (userId) => {
  const pool   = await getPool();
  const cartId = await getOrCreateActiveCart(userId);

  const items = await pool.request()
    .input('cartId', sql.Int, cartId)
    .query(`
      SELECT ci.CartItemID, ci.VariantID, ci.Quantity,
             pv.VariantName, pv.VariantValue, pv.VariantPriceDelta,
             p.ProductID, p.Name AS ProductName, p.BasePrice, p.SKU,
             (p.BasePrice + pv.VariantPriceDelta)            AS UnitPrice,
             (ci.Quantity * (p.BasePrice + pv.VariantPriceDelta)) AS LineTotal,
             img.ImageUrl AS PrimaryImageUrl,
             ISNULL(pv.VariantStockQty, p.StockQty)         AS AvailableStock
      FROM CartItems ci
      JOIN ProductVariants pv ON ci.VariantID = pv.VariantID
      JOIN Products p         ON pv.ProductID = p.ProductID
      LEFT JOIN (
        SELECT ProductID, MIN(ImageUrl) AS ImageUrl
        FROM ProductImages WHERE IsPrimary=1 GROUP BY ProductID
      ) img ON img.ProductID = p.ProductID
      WHERE ci.CartID = @cartId
    `);

  const cartTotal = items.recordset.reduce((s, i) => s + i.LineTotal, 0);
  return { cartId, items: items.recordset, cartTotal: Math.round(cartTotal * 100) / 100 };
};

const addOrUpdateItem = async (userId, variantId, quantity) => {
  const pool   = await getPool();
  const cartId = await getOrCreateActiveCart(userId);

  // Validate variant and stock
  const check = await pool.request()
    .input('vid', sql.Int, variantId)
    .query(`
      SELECT pv.VariantID, p.StockQty, pv.VariantStockQty
      FROM ProductVariants pv JOIN Products p ON pv.ProductID=p.ProductID
      WHERE pv.VariantID=@vid AND pv.IsActive=1 AND p.IsActive=1
    `);

  if (!check.recordset.length)
    throw Object.assign(new Error('Product variant not found'), { statusCode: 404 });

  const { StockQty, VariantStockQty } = check.recordset[0];
  const stock = VariantStockQty ?? StockQty;

  if (quantity > stock)
    throw Object.assign(new Error(`Only ${stock} units available in stock`), { statusCode: 400 });

  await pool.request()
    .input('cartId', sql.Int, cartId)
    .input('vid',    sql.Int, variantId)
    .input('qty',    sql.Int, quantity)
    .query(`
      IF EXISTS (SELECT 1 FROM CartItems WHERE CartID=@cartId AND VariantID=@vid)
        UPDATE CartItems SET Quantity=@qty, UpdatedAt=GETDATE() WHERE CartID=@cartId AND VariantID=@vid
      ELSE
        INSERT INTO CartItems (CartID,VariantID,Quantity) VALUES (@cartId,@vid,@qty)
    `);

  return getCart(userId);
};

const removeItem = async (userId, cartItemId) => {
  const pool   = await getPool();
  const cartId = await getOrCreateActiveCart(userId);
  await pool.request()
    .input('itemId', sql.Int, cartItemId)
    .input('cartId', sql.Int, cartId)
    .query('DELETE FROM CartItems WHERE CartItemID=@itemId AND CartID=@cartId');
  return getCart(userId);
};

const clearCart = async (cartId) => {
  const pool = await getPool();
  await pool.request()
    .input('cartId', sql.Int, cartId)
    .query('DELETE FROM CartItems WHERE CartID=@cartId');
};

const markCartConverted = async (cartId) => {
  const pool = await getPool();
  await pool.request()
    .input('cartId', sql.Int, cartId)
    .query("UPDATE Carts SET Status='Converted', UpdatedAt=GETDATE() WHERE CartID=@cartId");
};

module.exports = { getCart, addOrUpdateItem, removeItem, clearCart, markCartConverted, getOrCreateActiveCart };