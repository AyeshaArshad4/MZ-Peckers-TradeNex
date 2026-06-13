'use strict';
require('dotenv').config();
const bcrypt           = require('bcrypt');
const { getPool, sql, closePool } = require('../config/db');
const { SALT_ROUNDS }  = require('../config/constants');
const logger           = require('./logger');

const seed = async () => {
  logger.info('[SEED] Starting seed...');
  const pool = await getPool();

  // Hash passwords
  const adminHash    = await bcrypt.hash('Admin@1234',    SALT_ROUNDS);
  const customerHash = await bcrypt.hash('Customer@1234', SALT_ROUNDS);

  // Update seed users with real hashes
  const users = [
    { username: 'admin1',          hash: adminHash },
    { username: 'ali_contractor',  hash: customerHash },
    { username: 'sara_tileshop',   hash: customerHash },
    { username: 'usman_installer', hash: customerHash },
    { username: 'fatima_pending',  hash: customerHash },
  ];

  for (const u of users) {
    await pool.request()
      .input('hash',     sql.NVarChar(255), u.hash)
      .input('username', sql.NVarChar(50),  u.username)
      .query('UPDATE Users SET PasswordHash=@hash WHERE Username=@username');
    logger.info(`[SEED] Updated password for ${u.username}`);
  }

  logger.info('[SEED] Done! Login credentials:');
  logger.info('[SEED]   Admin:    admin@tradenex.com    / Admin@1234');
  logger.info('[SEED]   Customer: ali.contractor@gmail.com / Customer@1234');

  await closePool();
  process.exit(0);
};

seed().catch((err) => {
  logger.error('[SEED] Error:', err);
  process.exit(1);
});