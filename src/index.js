const fastify = require('fastify')({ 
  logger: true 
});
const { PrismaClient } = require('@prisma/client');
const jwt = require('@fastify/jwt');
const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const multipart = require('@fastify/multipart');
const logger = require('./config/logger');

// 创建Prisma客户端实例
const prisma = new PrismaClient();

// 注册插件
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'your-secret-key' });
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制文件大小为10MB
    files: 1 // 限制一次只能上传一个文件
  }
});

// 添加请求日志中间件
fastify.addHook('onRequest', async (request, reply) => {
  logger.info('收到请求', {
    method: request.method,
    url: request.url,
    headers: request.headers
  });
});

fastify.addHook('onResponse', async (request, reply) => {
  logger.info('请求完成', {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: reply.getResponseTime()
  });
});

// 添加错误处理中间件
fastify.setErrorHandler((error, request, reply) => {
  logger.error('请求处理错误', {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    },
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body
    }
  });
  
  reply.code(error.statusCode || 500).send({
    error: error.message || '服务器内部错误'
  });
});

// 配置Swagger
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Fastify API',
      description: 'API documentation',
      version: '1.0.0'
    },
    host: process.env.VERCEL ? 'autostudy.djjp.cn' : `localhost:${process.env.PORT || 3000}`,
    schemes: ['https', 'http'],
    consumes: ['application/json'],
    produces: ['application/json']
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

// 添加认证中间件装饰器
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: '未授权访问' });
  }
});

// 注册所有路由
fastify.register(require('./routes'))

// 根据环境判断启动方式
if (process.env.VERCEL) {
  // Vercel环境下使用serverless方式
  module.exports = async (req, res) => {
    await fastify.ready();
    try {
      await fastify.server.emit('request', req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  };
} else {
  // 本地开发环境下使用标准HTTP服务器
  const start = async () => {
    try {
      await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
      console.log(`Server is running on ${process.env.PORT || 3000}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}
