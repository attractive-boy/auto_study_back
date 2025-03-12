const pino = require('pino');
const dayjs = require('dayjs');

// 创建基础日志配置
const baseLogConfig = {
  timestamp: () => `,"time":"${dayjs().format()}"`
};

// 通用日志配置
const config = {
  ...baseLogConfig,
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
};

// 创建logger实例
const logger = pino(config);

module.exports = logger;