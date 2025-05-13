const winston = require('winston');
const path = require('path');

// 确保日志目录存在
const logDir = 'logs';
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// 自定义日志格式
const logFormat = printf(({ timestamp, level, message, ...meta }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(meta).length > 0) {
    msg += `\n${JSON.stringify(meta, null, 2)}`;
  }
  return msg;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    // 控制台输出
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
      // 设置控制台输出的编码
      handleExceptions: true,
      handleRejections: true
    }),
    // 错误日志文件
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      // 设置文件输出的编码
      options: { encoding: 'utf8' }
    }),
    // 所有日志文件
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      // 设置文件输出的编码
      options: { encoding: 'utf8' }
    })
  ]
});

// 添加未捕获异常的处理
logger.exceptions.handle(
  new transports.File({
    filename: path.join(logDir, 'exceptions.log'),
    maxsize: 5242880,
    maxFiles: 5,
    // 设置文件输出的编码
    options: { encoding: 'utf8' }
  })
);

module.exports = logger;