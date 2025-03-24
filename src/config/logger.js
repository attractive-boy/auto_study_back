const winston = require('winston');
require('winston-mongodb');

// 创建控制台传输器
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// MongoDB 传输器
const mongoTransport = new winston.transports.MongoDB({
  db: `mongodb://root:${process.env.MONGO_PASS}@47.121.208.223:27017/auto_study_app_logs?authSource=admin`,
  collection: 'system_logs',
  options: {
    useUnifiedTopology: true,
    auth: {
      username: 'root',
      password: process.env.MONGO_PASS
    }
  },
  metaKey: 'metadata',
  expireAfterSeconds: 2592000 // 30天后自动删除
});

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [consoleTransport, mongoTransport]
});

module.exports = logger;