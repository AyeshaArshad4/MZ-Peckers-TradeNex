'use strict';
require('dotenv').config();
const app              = require('./app');
const { getPool, closePool, testConnection } = require('./config/db');
const logger           = require('./utils/logger');

const PORT = parseInt(process.env.PORT) || 5000;

const start = async () => {
  try {
    // Test DB connectivity before starting HTTP server
    logger.info('[SERVER] Connecting to database...');
    const dbInfo = await testConnection();
    logger.info(`[SERVER] DB ready → ${dbInfo.server} / ${dbInfo.db}`);

    const server = app.listen(PORT, () => {
      logger.info(`[SERVER] TradeNex API running on http://localhost:${PORT}`);
      logger.info(`[SERVER] Environment: ${process.env.NODE_ENV}`);
      logger.info(`[SERVER] Health check: http://localhost:${PORT}/health`);
    });

    // ── Graceful shutdown ─────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`[SERVER] ${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await closePool();
        logger.info('[SERVER] Shutdown complete');
        process.exit(0);
      });
      // Force exit after 10 seconds
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('[SERVER] Unhandled Promise Rejection:', reason);
    });

  } catch (err) {
    logger.error('[SERVER] Failed to start:', err.message);
    process.exit(1);
  }
};

start();