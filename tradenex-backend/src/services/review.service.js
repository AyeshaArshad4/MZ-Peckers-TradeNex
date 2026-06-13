'use strict';
const { getPool, sql } = require('../config/db');

const createReview = async (userId, productId, { rating, reviewText }) => {
  const pool = await getPool();

  const dup = await pool.request()
    .input('uid', sql.Int, userId)
    .input('pid', sql.Int, productId)
    .query('SELECT ReviewID FROM Reviews WHERE UserID=@uid AND ProductID=@pid');
  if (dup.recordset.length)
    throw Object.assign(new Error('You have already reviewed this product'), { statusCode: 409 });

  const res = await pool.request()
    .input('uid',    sql.Int,           userId)
    .input('pid',    sql.Int,           productId)
    .input('rating', sql.TinyInt,       +rating)
    .input('text',   sql.NVarChar(2000), reviewText || null)
    .query(`
      INSERT INTO Reviews (UserID,ProductID,Rating,ReviewText)
      OUTPUT INSERTED.ReviewID, INSERTED.Rating, INSERTED.ReviewText, INSERTED.IsApproved, INSERTED.CreatedAt
      VALUES (@uid,@pid,@rating,@text)
    `);

  return res.recordset[0];
};

const getProductReviews = async (productId, approvedOnly = true) => {
  const pool  = await getPool();
  const where = approvedOnly ? 'AND r.IsApproved=1' : '';

  const res = await pool.request()
    .input('pid', sql.Int, productId)
    .query(`
      SELECT r.ReviewID, r.Rating, r.ReviewText, r.IsApproved, r.CreatedAt,
             u.FullName AS ReviewerName
      FROM Reviews r JOIN Users u ON r.UserID=u.UserID
      WHERE r.ProductID=@pid ${where}
      ORDER BY r.CreatedAt DESC
    `);

  return res.recordset;
};

const getPendingReviews = async () => {
  const pool = await getPool();
  const res  = await pool.request().query(`
    SELECT r.ReviewID, r.Rating, r.ReviewText, r.CreatedAt,
           u.FullName AS ReviewerName, p.Name AS ProductName
    FROM Reviews r
    JOIN Users u    ON r.UserID=u.UserID
    JOIN Products p ON r.ProductID=p.ProductID
    WHERE r.IsApproved=0 ORDER BY r.CreatedAt ASC
  `);
  return res.recordset;
};

const approveReview = async (reviewId, adminUserId) => {
  const pool = await getPool();
  await pool.request()
    .input('rid',     sql.Int, reviewId)
    .input('adminId', sql.Int, adminUserId)
    .query('UPDATE Reviews SET IsApproved=1, ApprovedAt=GETDATE(), ApprovedBy=@adminId WHERE ReviewID=@rid');
};

const deleteReview = async (reviewId) => {
  const pool = await getPool();
  await pool.request()
    .input('rid', sql.Int, reviewId)
    .query('DELETE FROM Reviews WHERE ReviewID=@rid');
};

module.exports = { createReview, getProductReviews, getPendingReviews, approveReview, deleteReview };