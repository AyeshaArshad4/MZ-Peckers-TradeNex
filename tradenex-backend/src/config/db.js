'use strict';
require('dotenv').config();
const sql    = require('mssql');
const logger = require('../utils/logger');

const buildConfig = () => {
  const useWindowsAuth = process.env.DB_WINDOWS_AUTH === 'true';
  const hasInstance    = !!process.env.DB_INSTANCE;

  const config = {
    server:   process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
      encrypt:                process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true,
      enableArithAbort:       true,
    },
    pool: {
      max:               parseInt(process.env.DB_POOL_MAX)           || 10,
      min:               parseInt(process.env.DB_POOL_MIN)           || 0,
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT)  || 30000,
    },
    connectionTimeout: 30000,
    requestTimeout:    30000,
  };

  // Use instanceName (needs Browser) OR direct port (no Browser needed)
  // If DB_INSTANCE is set → use Browser service lookup
  // If DB_PORT is set and no instance → connect directly to port
  if (hasInstance) {
    config.options.instanceName = process.env.DB_INSTANCE;
    logger.info(`[DB] Mode: Named instance lookup (requires SQL Server Browser)`);
  } else {
    config.port = parseInt(process.env.DB_PORT) || 1433;
    logger.info(`[DB] Mode: Direct port connection → port ${config.port}`);
  }

  if (useWindowsAuth) {
    config.options.trustedConnection = true;
    config.authentication = {
      type: 'ntlm',
      options: {
        domain:   process.env.USERDOMAIN || '',
        userName: process.env.USERNAME   || '',
        password: '',
      },
    };
  } else {
    config.user     = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
  }

  return config;
};

let pool = null;

const getPool = async () => {
  if (pool) return pool;

  try {
    const config = buildConfig();

    logger.info(`[DB] Server   → ${config.server}${config.port ? `:${config.port}` : `\\${config.options.instanceName}`}`);
    logger.info(`[DB] Database → ${config.database}`);
    logger.info(`[DB] Auth     → ${process.env.DB_WINDOWS_AUTH === 'true' ? `Windows (${process.env.USERNAME}@${process.env.USERDOMAIN})` : 'SQL Auth'}`);

    pool = await sql.connect(config);
    logger.info('[DB] ✓ Connected to SQL Server successfully!');

    pool.on('error', (err) => {
      logger.error('[DB] Pool error:', err.message);
      pool = null;
    });

    return pool;

  } catch (err) {
    pool = null;
    logger.error(`[DB] ✗ Connection failed [${err.code}]: ${err.message}`);
    printHelp(err);
    throw err;
  }
};

const printHelp = (err) => {
  const lines = {
    EINSTLOOKUP: [
      '❌ Instance not found. SQL Server Browser is not running.',
      '',
      '  OPTION A — Start SQL Server Browser:',
      '    services.msc → SQL Server Browser → Start → set Automatic',
      '',
      '  OPTION B (Recommended for local) — Use direct port instead:',
      '    1. SQL Server Config Manager → Protocols for SQLEXPRESS01',
      '       → TCP/IP Properties → IP Addresses → IPAll',
      '       → Set TCP Port = 1433, clear TCP Dynamic Ports → OK',
      '    2. Restart SQL Server service',
      '    3. Remove DB_INSTANCE from .env, keep DB_PORT=1433',
    ],
    ETIMEOUT: [
      '❌ Connection timed out.',
      '  1. Is SQL Server service running? (services.msc)',
      '  2. Is TCP/IP enabled? (SQL Server Config Manager)',
      '  3. Try DB_ENCRYPT=false in .env',
    ],
    ELOGIN: [
      '❌ Login failed.',
      '  1. Enable Mixed Mode: SSMS → Server Properties → Security → Mixed Mode → Restart',
      '  2. Or keep DB_WINDOWS_AUTH=true and make sure you run as Fahama',
    ],
  };

  const help = lines[err.code] || [`❌ Unknown error: ${err.message}`];
  console.log('\n' + '─'.repeat(60));
  help.forEach(l => console.log(l));
  console.log('─'.repeat(60) + '\n');
};

const closePool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info('[DB] Pool closed.');
  }
};

const testConnection = async () => {
  const p   = await getPool();
  const res = await p.request().query(`
    SELECT
      @@SERVERNAME AS server,
      DB_NAME()    AS db,
      SYSTEM_USER  AS loginUser,
      @@VERSION    AS version
  `);
  return res.recordset[0];
};

module.exports = { getPool, closePool, testConnection, sql };