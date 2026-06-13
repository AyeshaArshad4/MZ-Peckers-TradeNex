'use strict';
const winston            = require('winston');
const DailyRotateFile    = require('winston-daily-rotate-file');
const path               = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const IS_PROD = process.env.NODE_ENV === 'production';

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const extra = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${extra}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: IS_PROD ? 'info' : 'debug',
  transports: [
    ...(!IS_PROD ? [new winston.transports.Console({ format: consoleFormat })] : []),
    new DailyRotateFile({
      filename:    path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level:       'error',
      format:      fileFormat,
      maxFiles:    '14d',
    }),
    new DailyRotateFile({
      filename:    path.join(LOG_DIR, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format:      fileFormat,
      maxFiles:    '7d',
    }),
  ],
});

module.exports = logger;