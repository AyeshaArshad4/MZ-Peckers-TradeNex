'use strict';
const { getPool, sql } = require('../config/db');
const orderService     = require('./order.service');

const getQuoteById = async (quoteId, userId = null) => {
  const pool = await getPool();
  const req  = pool.request().input('id', sql.Int, quoteId);
  if (userId) req.input('uid', sql.Int, userId);

  const [quote, items] = await Promise.all([
    req.query(`
      SELECT q.*, u.FullName AS CustomerName, u.Email AS CustomerEmail, u.CompanyName
      FROM Quotes q JOIN Users u ON q.UserID=u.UserID
      WHERE q.QuoteID=@id ${userId ? 'AND q.UserID=@uid' : ''}
    `),
    pool.request().input('id', sql.Int, quoteId).query(`
      SELECT qi.QuoteItemID, qi.VariantID, qi.Quantity, qi.RequestedUnitPrice,
             pv.VariantName, pv.VariantValue, p.Name AS ProductName, p.SKU, p.BasePrice
      FROM QuoteItems qi
      JOIN ProductVariants pv ON qi.VariantID=pv.VariantID
      JOIN Products p         ON pv.ProductID=p.ProductID
      WHERE qi.QuoteID=@id
    `),
  ]);

  if (!quote.recordset.length) return null;
  return { ...quote.recordset[0], items: items.recordset };
};

const createQuote = async (userId, { customerNotes, targetPrice, items }) => {
  const pool = await getPool();

  const res = await pool.request()
    .input('uid',         sql.Int,          userId)
    .input('notes',       sql.NVarChar(1000), customerNotes || null)
    .input('targetPrice', sql.Decimal(10,2), targetPrice   || null)
    .query(`
      INSERT INTO Quotes (UserID, CustomerNotes, TargetPrice)
      OUTPUT INSERTED.QuoteID
      VALUES (@uid, @notes, @targetPrice)
    `);

  const quoteId = res.recordset[0].QuoteID;

  for (const item of items) {
    await pool.request()
      .input('qid',   sql.Int,          quoteId)
      .input('vid',   sql.Int,          item.variantId)
      .input('qty',   sql.Int,          item.quantity)
      .input('price', sql.Decimal(10,2), item.requestedUnitPrice || null)
      .query('INSERT INTO QuoteItems (QuoteID,VariantID,Quantity,RequestedUnitPrice) VALUES (@qid,@vid,@qty,@price)');
  }

  return getQuoteById(quoteId);
};

const getUserQuotes = async (userId, page = 1, limit = 10) => {
  const pool   = await getPool();
  const offset = (page - 1) * limit;

  const res = await pool.request()
    .input('uid',    sql.Int, userId)
    .input('limit',  sql.Int, +limit)
    .input('offset', sql.Int, offset)
    .query(`
      SELECT q.QuoteID, q.Status, q.CustomerNotes, q.TargetPrice,
             q.AdminQuotedTotal, q.CreatedAt, q.RespondedAt,
             COUNT(qi.QuoteItemID) AS TotalItems
      FROM Quotes q LEFT JOIN QuoteItems qi ON qi.QuoteID=q.QuoteID
      WHERE q.UserID=@uid
      GROUP BY q.QuoteID,q.Status,q.CustomerNotes,q.TargetPrice,q.AdminQuotedTotal,q.CreatedAt,q.RespondedAt
      ORDER BY q.CreatedAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return res.recordset;
};

const getAllQuotes = async ({ status, page = 1, limit = 10 }) => {
  const pool   = await getPool();
  const offset = (page - 1) * limit;
  const req    = pool.request();
  const where  = status ? 'WHERE q.Status=@status' : '';
  if (status) req.input('status', sql.NVarChar(20), status);
  req.input('limit', sql.Int, +limit).input('offset', sql.Int, offset);

  const res = await req.query(`
    SELECT q.QuoteID, q.Status, q.CustomerNotes, q.TargetPrice,
           q.AdminQuotedTotal, q.AdminNotes, q.CreatedAt, q.RespondedAt,
           u.FullName AS CustomerName, u.Email AS CustomerEmail,
           u.CompanyName, COUNT(qi.QuoteItemID) AS TotalItems
    FROM Quotes q
    JOIN  Users u ON q.UserID=u.UserID
    LEFT JOIN QuoteItems qi ON qi.QuoteID=q.QuoteID
    ${where}
    GROUP BY q.QuoteID,q.Status,q.CustomerNotes,q.TargetPrice,q.AdminQuotedTotal,
             q.AdminNotes,q.CreatedAt,q.RespondedAt,u.FullName,u.Email,u.CompanyName
    ORDER BY q.CreatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return res.recordset;
};

const respondToQuote = async (quoteId, adminUserId, { adminQuotedTotal, adminNotes }) => {
  const pool = await getPool();

  const check = await pool.request()
    .input('id', sql.Int, quoteId)
    .query("SELECT QuoteID, Status FROM Quotes WHERE QuoteID=@id");
  if (!check.recordset.length)
    throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
  if (check.recordset[0].Status !== 'Pending')
    throw Object.assign(new Error('Quote has already been responded to'), { statusCode: 400 });

  await pool.request()
    .input('id',    sql.Int,           quoteId)
    .input('total', sql.Decimal(10,2), adminQuotedTotal)
    .input('notes', sql.NVarChar(1000), adminNotes || null)
    .query(`
      UPDATE Quotes
      SET Status='Responded', AdminQuotedTotal=@total, AdminNotes=@notes,
          RespondedAt=GETDATE(), UpdatedAt=GETDATE()
      WHERE QuoteID=@id
    `);

  return getQuoteById(quoteId);
};

const acceptQuote = async (quoteId, userId) => {
  const pool  = await getPool();
  const quote = await getQuoteById(quoteId, userId);

  if (!quote)
    throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
  if (quote.Status !== 'Responded')
    throw Object.assign(new Error('Quote must be in Responded status to accept'), { statusCode: 400 });

  // Create an order from the quote items
  const pool2 = await getPool();
  const res   = await pool2.request()
    .input('uid',   sql.Int,          userId)
    .input('total', sql.Decimal(10,2), quote.AdminQuotedTotal)
    .query(`
      INSERT INTO Orders (UserID, Subtotal, Notes)
      OUTPUT INSERTED.OrderID
      VALUES (@uid, @total, 'Converted from Quote #${quoteId}')
    `);

  const orderId = res.recordset[0].OrderID;

  for (const item of quote.items) {
    await pool2.request()
      .input('oid',   sql.Int,          orderId)
      .input('vid',   sql.Int,          item.VariantID)
      .input('qty',   sql.Int,          item.Quantity)
      .input('price', sql.Decimal(10,2), item.RequestedUnitPrice || item.BasePrice)
      .query('INSERT INTO OrderItems (OrderID,VariantID,Quantity,UnitPrice) VALUES (@oid,@vid,@qty,@price)');
  }

  await pool2.request()
    .input('oid', sql.Int, orderId)
    .query("INSERT INTO OrderStatusHistory (OrderID,Status) VALUES (@oid,'Pending')");

  // Mark quote as Accepted with linked order
  await pool2.request()
    .input('qid', sql.Int, quoteId)
    .input('oid', sql.Int, orderId)
    .query("UPDATE Quotes SET Status='Accepted', ConvertedOrderID=@oid, UpdatedAt=GETDATE() WHERE QuoteID=@qid");

  return getQuoteById(quoteId);
};

const rejectQuote = async (quoteId, userId) => {
  const pool = await getPool();
  await pool.request()
    .input('qid', sql.Int, quoteId)
    .input('uid', sql.Int, userId)
    .query("UPDATE Quotes SET Status='Rejected', UpdatedAt=GETDATE() WHERE QuoteID=@qid AND UserID=@uid");
};

module.exports = { createQuote, getQuoteById, getUserQuotes, getAllQuotes, respondToQuote, acceptQuote, rejectQuote };