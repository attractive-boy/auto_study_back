const pino = require('pino');
const dayjs = require('dayjs');

// 创建基础日志配置
const baseLogConfig = {
  timestamp: () => `,"time":"${dayjs().format()}"`
};

// 通用日志配置
const config = {
  ...baseLogConfig,
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
};

// 在非生产环境下使用pino-pretty
if (process.env.NODE_ENV !== 'production') {
  config.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  };
}

// 创建logger实例
const logger = pino(config);

module.exports = logger;