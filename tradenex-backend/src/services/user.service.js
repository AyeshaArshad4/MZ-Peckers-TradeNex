'use strict';
const { getPool, sql } = require('../config/db');

const SAFE_FIELDS = `
  UserID, Role, Username, Email, FullName, Phone, CompanyName,
  CustomerType, Country, ApprovalStatus, RejectionReason,
  IsActive, LastLoginAt, CreatedAt, UpdatedAt
`;

const getAllUsers = async ({ role, approvalStatus, page = 1, limit = 20 }) => {
  const pool = await getPool();
  const offset = (page - 1) * limit;
  const req = pool.request();
  const conds = [];

  if (role)           { conds.push('Role = @role');                       req.input('role',           sql.NVarChar(20), role); }
  if (approvalStatus) { conds.push('ApprovalStatus = @approvalStatus');   req.input('approvalStatus', sql.NVarChar(20), approvalStatus); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const [data, count] = await Promise.all([
    req.query(`SELECT ${SAFE_FIELDS} FROM Users ${where} ORDER BY CreatedAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`),
    pool.request().query(`SELECT COUNT(*) AS total FROM Users ${where}`),
  ]);

  return {
    users:      data.recordset,
    total:      count.recordset[0].total,
    page:       +page,
    totalPages: Math.ceil(count.recordset[0].total / limit),
  };
};

const getUserById = async (userId) => {
  const pool = await getPool();
  const res = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`SELECT ${SAFE_FIELDS} FROM Users WHERE UserID = @uid`);
  return res.recordset[0] || null;
};

const approveUser = async (userId) => {
  const pool = await getPool();
  const check = await pool.request()
    .input('uid', sql.Int, userId)
    .query("SELECT UserID, ApprovalStatus FROM Users WHERE UserID = @uid AND Role = 'Customer'");
  if (!check.recordset.length) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  if (check.recordset[0].ApprovalStatus === 'Approved') throw Object.assign(new Error('Already approved'), { statusCode: 400 });

  await pool.request()
    .input('uid', sql.Int, userId)
    .query("UPDATE Users SET ApprovalStatus='Approved', RejectionReason=NULL, UpdatedAt=GETDATE() WHERE UserID=@uid");
  return getUserById(userId);
};

const rejectUser = async (userId, reason) => {
  const pool = await getPool();
  const check = await pool.request()
    .input('uid', sql.Int, userId)
    .query("SELECT UserID FROM Users WHERE UserID = @uid AND Role = 'Customer'");
  if (!check.recordset.length) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });

  await pool.request()
    .input('uid',    sql.Int,          userId)
    .input('reason', sql.NVarChar(255), reason || null)
    .query("UPDATE Users SET ApprovalStatus='Rejected', RejectionReason=@reason, UpdatedAt=GETDATE() WHERE UserID=@uid");
  return getUserById(userId);
};

const updateProfile = async (userId, fields) => {
  const pool = await getPool();
  await pool.request()
    .input('uid',         sql.Int,          userId)
    .input('fullName',    sql.NVarChar(100), fields.fullName    || null)
    .input('phone',       sql.NVarChar(20),  fields.phone       || null)
    .input('companyName', sql.NVarChar(120), fields.companyName || null)
    .input('country',     sql.NVarChar(50),  fields.country     || null)
    .query(`
      UPDATE Users
      SET FullName    = COALESCE(@fullName,    FullName),
          Phone       = COALESCE(@phone,       Phone),
          CompanyName = COALESCE(@companyName, CompanyName),
          Country     = COALESCE(@country,     Country),
          UpdatedAt   = GETDATE()
      WHERE UserID = @uid
    `);
  return getUserById(userId);
};

module.exports = { getAllUsers, getUserById, approveUser, rejectUser, updateProfile };