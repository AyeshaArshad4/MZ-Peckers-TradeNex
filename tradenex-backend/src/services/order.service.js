'use strict';
const { getPool, sql } = require('../config/db');
const { getCart, markCartConverted } = require('./cart.service');
const { CANCELLABLE_STATUSES }       = require('../config/constants');

const getOrderById = async (orderId, userId = null) => {
  const pool = await getPool();
  const req  = pool.request().input('id', sql.Int, orderId);
  if (userId) req.input('uid', sql.Int, userId);

  const [order, items, history] = await Promise.all([
    req.query(`
      SELECT o.*, u.FullName AS CustomerName, u.Email AS CustomerEmail,
             u.Phone AS CustomerPhone, u.CompanyName
      FROM Orders o JOIN Users u ON o.UserID=u.UserID
      WHERE o.OrderID=@id ${userId ? 'AND o.UserID=@uid' : ''}
    `),
    pool.request().input('id', sql.Int, orderId).query(`
      SELECT oi.OrderItemID, oi.VariantID, oi.Quantity, oi.UnitPrice, oi.LineTotal,
             pv.VariantName, pv.VariantValue, p.Name AS ProductName, p.SKU,
             img.ImageUrl AS PrimaryImageUrl
      FROM OrderItems oi
      JOIN ProductVariants pv ON oi.VariantID=pv.VariantID
      JOIN Products p         ON pv.ProductID=p.ProductID
      LEFT JOIN (SELECT ProductID, MIN(ImageUrl) AS ImageUrl FROM ProductImages WHERE IsPrimary=1 GROUP BY ProductID) img
             ON img.ProductID=p.ProductID
      WHERE oi.OrderID=@id
    `),
    pool.request().input('id', sql.Int, orderId).query(`
      SELECT osh.Status, osh.Notes, osh.ChangedAt, u.FullName AS ChangedBy
      FROM OrderStatusHistory osh
      LEFT JOIN Users u ON osh.ChangedByAdminUserID=u.UserID
      WHERE osh.OrderID=@id ORDER BY osh.ChangedAt ASC
    `),
  ]);

  if (!order.recordset.length) return null;
  return { ...order.recordset[0], items: items.recordset, statusHistory: history.recordset };
};

const placeOrder = async (userId, shippingAddress, notes) => {
  const pool   = await getPool();
  const cart   = await getCart(userId);

  if (!cart.items.length)
    throw Object.assign(new Error('Your cart is empty'), { statusCode: 400 });

  const subtotal = cart.cartTotal;

  const res = await pool.request()
    .input('uid',     sql.Int,          userId)
    .input('total',   sql.Decimal(10,2), subtotal)
    .input('address', sql.NVarChar(500), shippingAddress || null)
    .input('notes',   sql.NVarChar(500), notes           || null)
    .query(`
      INSERT INTO Orders (UserID,Subtotal,ShippingAddress,Notes)
      OUTPUT INSERTED.OrderID
      VALUES (@uid,@total,@address,@notes)
    `);

  const orderId = res.recordset[0].OrderID;

  for (const item of cart.items) {
    await pool.request()
      .input('oid',   sql.Int,          orderId)
      .input('vid',   sql.Int,          item.VariantID)
      .input('qty',   sql.Int,          item.Quantity)
      .input('price', sql.Decimal(10,2), item.UnitPrice)
      .query('INSERT INTO OrderItems (OrderID,VariantID,Quantity,UnitPrice) VALUES (@oid,@vid,@qty,@price)');
  }

  await pool.request()
    .input('oid', sql.Int, orderId)
    .query("INSERT INTO OrderStatusHistory (OrderID,Status) VALUES (@oid,'Pending')");

  await markCartConverted(cart.cartId);

  return getOrderById(orderId);
};

const getUserOrders = async (userId, page = 1, limit = 10) => {
  const pool   = await getPool();
  const offset = (page - 1) * limit;

  const res = await pool.request()
    .input('uid',    sql.Int, userId)
    .input('limit',  sql.Int, +limit)
    .input('offset', sql.Int, offset)
    .query(`
      SELECT o.OrderID, o.OrderStatus, o.PaymentStatus, o.Subtotal,
             o.OrderPlacedAt, o.CancellationDecision,
             COUNT(oi.OrderItemID) AS TotalItems
      FROM Orders o
      LEFT JOIN OrderItems oi ON oi.OrderID=o.OrderID
      WHERE o.UserID=@uid
      GROUP BY o.OrderID,o.OrderStatus,o.PaymentStatus,o.Subtotal,o.OrderPlacedAt,o.CancellationDecision
      ORDER BY o.OrderPlacedAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return res.recordset;
};

const getAllOrders = async ({ status, payment, userId, page = 1, limit = 10 }) => {
  const pool   = await getPool();
  const offset = (page - 1) * limit;
  const req    = pool.request();
  const conds  = [];

  if (status)  { conds.push('o.OrderStatus=@status');   req.input('status',  sql.NVarChar(20), status); }
  if (payment) { conds.push('o.PaymentStatus=@payment'); req.input('payment', sql.NVarChar(10), payment); }
  if (userId)  { conds.push('o.UserID=@uid');            req.input('uid',     sql.Int,          +userId); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  req.input('limit', sql.Int, +limit).input('offset', sql.Int, offset);

  const [data, cnt] = await Promise.all([
    req.query(`
      SELECT o.OrderID, o.OrderStatus, o.PaymentStatus, o.Subtotal, o.OrderPlacedAt,
             o.CancellationDecision, o.CancellationType,
             u.FullName AS CustomerName, u.Email AS CustomerEmail,
             COUNT(oi.OrderItemID) AS TotalItems
      FROM Orders o
      JOIN  Users u ON o.UserID=u.UserID
      LEFT JOIN OrderItems oi ON oi.OrderID=o.OrderID
      ${where}
      GROUP BY o.OrderID,o.OrderStatus,o.PaymentStatus,o.Subtotal,o.OrderPlacedAt,
               o.CancellationDecision,o.CancellationType,u.FullName,u.Email
      ORDER BY o.OrderPlacedAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `),
    pool.request().query(`SELECT COUNT(*) AS total FROM Orders o ${where}`),
  ]);

  return {
    orders:     data.recordset,
    total:      cnt.recordset[0].total,
    page:       +page,
    totalPages: Math.ceil(cnt.recordset[0].total / limit),
  };
};

const updateOrderStatus = async (orderId, status, adminUserId, notes) => {
  const pool = await getPool();

  const check = await pool.request()
    .input('id', sql.Int, orderId)
    .query('SELECT OrderID, OrderStatus FROM Orders WHERE OrderID=@id');
  if (!check.recordset.length)
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  await pool.request()
    .input('id',     sql.Int,          orderId)
    .input('status', sql.NVarChar(20), status)
    .query('UPDATE Orders SET OrderStatus=@status, UpdatedAt=GETDATE() WHERE OrderID=@id');

  await pool.request()
    .input('id',      sql.Int,          orderId)
    .input('status',  sql.NVarChar(20), status)
    .input('adminId', sql.Int,          adminUserId)
    .input('notes',   sql.NVarChar(255), notes || null)
    .query('INSERT INTO OrderStatusHistory (OrderID,Status,ChangedByAdminUserID,Notes) VALUES (@id,@status,@adminId,@notes)');

  return getOrderById(orderId);
};

const updatePaymentStatus = async (orderId, paymentStatus) => {
  const pool = await getPool();
  await pool.request()
    .input('id',      sql.Int,          orderId)
    .input('payment', sql.NVarChar(10), paymentStatus)
    .query('UPDATE Orders SET PaymentStatus=@payment, UpdatedAt=GETDATE() WHERE OrderID=@id');
  return getOrderById(orderId);
};

const requestCancellation = async (orderId, userId, reason) => {
  const pool = await getPool();
  const res  = await pool.request()
    .input('id',  sql.Int, orderId)
    .input('uid', sql.Int, userId)
    .query('SELECT OrderStatus FROM Orders WHERE OrderID=@id AND UserID=@uid');

  if (!res.recordset.length)
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  const { OrderStatus } = res.recordset[0];
  if (!CANCELLABLE_STATUSES.includes(OrderStatus))
    throw Object.assign(new Error(`Cannot cancel an order in '${OrderStatus}' status`), { statusCode: 400 });

  await pool.request()
    .input('id',     sql.Int,          orderId)
    .input('reason', sql.NVarChar(255), reason || null)
    .query(`
      UPDATE Orders
      SET CancellationType='Request', CancellationReason=@reason,
          CancellationRequestedAt=GETDATE(), UpdatedAt=GETDATE()
      WHERE OrderID=@id
    `);
};

const decideCancellation = async (orderId, decision, adminUserId) => {
  const pool = await getPool();

  if (decision === 'Approved') {
    await updateOrderStatus(orderId, 'Cancelled', adminUserId, 'Cancellation request approved');
  }

  await pool.request()
    .input('id',       sql.Int,          orderId)
    .input('decision', sql.NVarChar(20), decision)
    .query(`
      UPDATE Orders
      SET CancellationDecision=@decision, CancellationReviewedAt=GETDATE(), UpdatedAt=GETDATE()
      WHERE OrderID=@id
    `);

  return getOrderById(orderId);
};

module.exports = {
  placeOrder, getOrderById, getUserOrders, getAllOrders,
  updateOrderStatus, updatePaymentStatus, requestCancellation, decideCancellation,
};