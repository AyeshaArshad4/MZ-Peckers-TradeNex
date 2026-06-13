'use strict';
const bcrypt    = require('bcrypt');
const { getPool, sql } = require('../config/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { SALT_ROUNDS, REFRESH_TOKEN_TTL_MS } = require('../config/constants');

const buildPayload = (u) => ({
  userId: u.UserID, email: u.Email, role: u.Role, approvalStatus: u.ApprovalStatus,
});

// ── REGISTER ─────────────────────────────────────────────────
const register = async ({ username, email, password, fullName, phone, companyName, customerType, country }) => {
  const pool = await getPool();

  const dup = await pool.request()
    .input('email',    sql.NVarChar(254), email)
    .input('username', sql.NVarChar(50),  username)
    .query('SELECT UserID FROM Users WHERE Email = @email OR Username = @username');

  if (dup.recordset.length)
    throw Object.assign(new Error('Email or username already registered'), { statusCode: 409 });

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const res = await pool.request()
    .input('username',     sql.NVarChar(50),  username)
    .input('email',        sql.NVarChar(254), email)
    .input('hash',         sql.NVarChar(255), hash)
    .input('fullName',     sql.NVarChar(100), fullName)
    .input('phone',        sql.NVarChar(20),  phone)
    .input('companyName',  sql.NVarChar(120), companyName  || null)
    .input('customerType', sql.NVarChar(30),  customerType || null)
    .input('country',      sql.NVarChar(50),  country      || null)
    .query(`
      INSERT INTO Users (Role,Username,Email,PasswordHash,FullName,Phone,CompanyName,CustomerType,Country)
      OUTPUT INSERTED.UserID, INSERTED.Username, INSERTED.Email,
             INSERTED.FullName, INSERTED.Role, INSERTED.ApprovalStatus
      VALUES ('Customer',@username,@email,@hash,@fullName,@phone,@companyName,@customerType,@country)
    `);

  return res.recordset[0];
};

// ── LOGIN ─────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const pool = await getPool();

  const res = await pool.request()
    .input('email', sql.NVarChar(254), email)
    .query(`
      SELECT UserID,Email,Username,FullName,PasswordHash,Role,
             ApprovalStatus,IsActive,CompanyName,CustomerType,Country
      FROM   Users WHERE Email = @email
    `);

  const user = res.recordset[0];

  // Constant-time compare even when user not found (prevents timing attacks)
  const dummy = '$2b$12$invalidhashfortimingprotectionxxxxxxxxxxxxxxxxxxxx';
  const valid = await bcrypt.compare(password, user?.PasswordHash || dummy);

  if (!user || !valid)
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  if (!user.IsActive)
    throw Object.assign(new Error('Account deactivated. Contact support.'), { statusCode: 403 });
  if (user.ApprovalStatus === 'PendingApproval')
    throw Object.assign(new Error('Account is awaiting admin approval'), { statusCode: 403 });
  if (user.ApprovalStatus === 'Rejected')
    throw Object.assign(new Error('Account registration was rejected'), { statusCode: 403 });

  // Update last login
  await pool.request()
    .input('uid', sql.Int, user.UserID)
    .query('UPDATE Users SET LastLoginAt = GETDATE() WHERE UserID = @uid');

  const accessToken  = signAccessToken(buildPayload(user));
  const refreshToken = signRefreshToken({ userId: user.UserID });
  const expiresAt    = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await pool.request()
    .input('uid',       sql.Int,          user.UserID)
    .input('token',     sql.NVarChar(512), refreshToken)
    .input('expiresAt', sql.DateTime2,    expiresAt)
    .query('INSERT INTO RefreshTokens (UserID,Token,ExpiresAt) VALUES (@uid,@token,@expiresAt)');

  return {
    accessToken,
    refreshToken,
    user: {
      userId:         user.UserID,
      username:       user.Username,
      fullName:       user.FullName,
      email:          user.Email,
      role:           user.Role,
      approvalStatus: user.ApprovalStatus,
      companyName:    user.CompanyName,
      customerType:   user.CustomerType,
      country:        user.Country,
    },
  };
};

// ── REFRESH (token rotation) ──────────────────────────────────
const refresh = async (oldToken) => {
  let decoded;
  try { decoded = verifyRefreshToken(oldToken); }
  catch { throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 }); }

  const pool = await getPool();

  const stored = await pool.request()
    .input('token', sql.NVarChar(512), oldToken)
    .query('SELECT TokenID,UserID,ExpiresAt,IsRevoked FROM RefreshTokens WHERE Token = @token');

  const record = stored.recordset[0];

  if (!record || record.IsRevoked || new Date(record.ExpiresAt) < new Date()) {
    // Possible reuse attack — revoke all tokens for user
    if (record?.IsRevoked) {
      await pool.request()
        .input('uid', sql.Int, decoded.userId)
        .query('UPDATE RefreshTokens SET IsRevoked = 1 WHERE UserID = @uid');
    }
    throw Object.assign(new Error('Refresh token expired or revoked. Please log in.'), { statusCode: 401 });
  }

  const userRes = await pool.request()
    .input('uid', sql.Int, decoded.userId)
    .query('SELECT UserID,Email,Username,Role,ApprovalStatus,IsActive FROM Users WHERE UserID = @uid AND IsActive = 1');

  const user = userRes.recordset[0];
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 401 });

  // Revoke old token
  await pool.request()
    .input('tid', sql.Int, record.TokenID)
    .query('UPDATE RefreshTokens SET IsRevoked = 1 WHERE TokenID = @tid');

  const newAccess  = signAccessToken(buildPayload(user));
  const newRefresh = signRefreshToken({ userId: user.UserID });
  const expiresAt  = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await pool.request()
    .input('uid',       sql.Int,          user.UserID)
    .input('token',     sql.NVarChar(512), newRefresh)
    .input('expiresAt', sql.DateTime2,    expiresAt)
    .query('INSERT INTO RefreshTokens (UserID,Token,ExpiresAt) VALUES (@uid,@token,@expiresAt)');

  return { accessToken: newAccess, refreshToken: newRefresh };
};

// ── LOGOUT ────────────────────────────────────────────────────
const logout = async (token) => {
  if (!token) return;
  const pool = await getPool();
  await pool.request()
    .input('token', sql.NVarChar(512), token)
    .query('UPDATE RefreshTokens SET IsRevoked = 1 WHERE Token = @token');
};

// ── CHANGE PASSWORD ───────────────────────────────────────────
const changePassword = async (userId, currentPassword, newPassword) => {
  const pool = await getPool();
  const res = await pool.request()
    .input('uid', sql.Int, userId)
    .query('SELECT PasswordHash FROM Users WHERE UserID = @uid');

  const user = res.recordset[0];
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const valid = await bcrypt.compare(currentPassword, user.PasswordHash);
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await pool.request()
    .input('uid',  sql.Int,          userId)
    .input('hash', sql.NVarChar(255), newHash)
    .query('UPDATE Users SET PasswordHash = @hash, UpdatedAt = GETDATE() WHERE UserID = @uid');

  // Force re-login everywhere
  await pool.request()
    .input('uid', sql.Int, userId)
    .query('UPDATE RefreshTokens SET IsRevoked = 1 WHERE UserID = @uid');
};

module.exports = { register, login, refresh, logout, changePassword };