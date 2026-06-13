'use strict';
const { getPool, sql } = require('../config/db');

const createQuery = async (userId, productId, question) => {
  const pool = await getPool();
  const res  = await pool.request()
    .input('uid',      sql.Int,           userId)
    .input('pid',      sql.Int,           productId || null)
    .input('question', sql.NVarChar(2000), question)
    .query(`
      INSERT INTO CustomerQueries (UserID,ProductID,Question)
      OUTPUT INSERTED.QueryID, INSERTED.Question, INSERTED.Status, INSERTED.CreatedAt
      VALUES (@uid,@pid,@question)
    `);
  return res.recordset[0];
};

const getAllQueries = async ({ status, page = 1, limit = 20 }) => {
  const pool   = await getPool();
  const offset = (page - 1) * limit;
  const req    = pool.request();
  const where  = status ? 'WHERE cq.Status=@status' : '';
  if (status) req.input('status', sql.NVarChar(20), status);
  req.input('limit', sql.Int, +limit).input('offset', sql.Int, offset);

  const res = await req.query(`
    SELECT cq.QueryID, cq.Question, cq.Status, cq.CreatedAt,
           u.FullName AS CustomerName, u.Email AS CustomerEmail,
           p.Name AS ProductName,
           qr.ResponseText, qr.CreatedAt AS RespondedAt
    FROM CustomerQueries cq
    JOIN  Users u       ON cq.UserID=u.UserID
    LEFT JOIN Products p ON cq.ProductID=p.ProductID
    LEFT JOIN QueryResponses qr ON qr.QueryID=cq.QueryID
    ${where}
    ORDER BY cq.CreatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return res.recordset;
};

const getUserQueries = async (userId) => {
  const pool = await getPool();
  const res  = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`
      SELECT cq.QueryID, cq.Question, cq.Status, cq.CreatedAt,
             p.Name AS ProductName,
             qr.ResponseText, qr.CreatedAt AS RespondedAt
      FROM CustomerQueries cq
      LEFT JOIN Products p ON cq.ProductID=p.ProductID
      LEFT JOIN QueryResponses qr ON qr.QueryID=cq.QueryID
      WHERE cq.UserID=@uid ORDER BY cq.CreatedAt DESC
    `);
  return res.recordset;
};

const respondToQuery = async (queryId, adminUserId, responseText) => {
  const pool = await getPool();

  const check = await pool.request()
    .input('id', sql.Int, queryId)
    .query('SELECT QueryID, Status FROM CustomerQueries WHERE QueryID=@id');
  if (!check.recordset.length)
    throw Object.assign(new Error('Query not found'), { statusCode: 404 });
  if (check.recordset[0].Status === 'Answered')
    throw Object.assign(new Error('Query already answered'), { statusCode: 400 });

  await pool.request()
    .input('id',       sql.Int,           queryId)
    .input('adminId',  sql.Int,           adminUserId)
    .input('response', sql.NVarChar(2000), responseText)
    .query('INSERT INTO QueryResponses (QueryID,AdminUserID,ResponseText) VALUES (@id,@adminId,@response)');

  await pool.request()
    .input('id', sql.Int, queryId)
    .query("UPDATE CustomerQueries SET Status='Answered' WHERE QueryID=@id");
};

module.exports = { createQuery, getAllQueries, getUserQueries, respondToQuery };