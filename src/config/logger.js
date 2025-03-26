const winston = require('winston');
require('winston-mongodb');

// 自定义日志级别
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'grey'
  }
};

// 创建控制台传输器
const consoleTransport = new winston.transports.Console({
 // level: 'error',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// MongoDB 传输器
const mongoTransport = new winston.transports.MongoDB({
  level: 'error',
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
  
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [consoleTransport, mongoTransport]
});

// 添加颜色支持
winston.addColors(customLevels.colors);

module.exports = logger;