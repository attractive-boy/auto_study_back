const fastify = require('fastify')();
const { PrismaClient } = require('@prisma/client');
const jwt = require('@fastify/jwt');
const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const logger = require('./config/logger');

// 创建Prisma客户端实例
const prisma = new PrismaClient();

// 配置Fastify使用自定义日志
fastify.log = logger;

// 注册插件
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'your-secret-key' });
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// 添加请求日志中间件
fastify.addHook('onRequest', async (request, reply) => {
  request.log.info({ req: request }, 'incoming request');
});

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info({
    res: reply,
    responseTime: reply.getResponseTime()
  }, 'request completed');
});

// 配置Swagger
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Fastify API',
      description: 'API documentation',
      version: '1.0.0'
    },
    host: `${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    // basePath: '/api'
  }
});

fastify.register(swaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});

// 装饰器添加prisma客户端
fastify.decorate('prisma', prisma);

// 注册所有路由
fastify.register(require('./routes'))

// 启动服务器
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    logger.info(`Server is running on ${fastify.server.address().port}`);
  } catch (err) {
    logger.error(err, 'Error starting server');
    process.exit(1);
  }
};

start();