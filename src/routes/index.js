// 路由模块统一入口

async function routes(fastify, options) {
  // 注册认证相关路由
  fastify.register(require('./auth'));

  // 注册订单管理路由
  //fastify.register(require('./orders'));

  // 注册支付管理路由
  //fastify.register(require('./payments'));

  // 注册统计分析路由
  fastify.register(require('./statistics'));

  // 注册隐私政策路由
  fastify.register(require('./privacy'));

  // 注册店铺管理路由
  fastify.register(require('./stores'));

  // 健康检查路由
  fastify.get('/health', {
    schema: {
      description: '健康检查接口',
      tags: ['系统'],
      summary: '系统健康状态检查',
      response: {
        200: {
          description: '系统正常运行',
          type: 'object',
          properties: {
            status: { type: 'string', description: '系统状态', example: 'OK' }
          }
        },
        500: {
          description: '系统内部错误',
          type: 'object',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      return { status: 'OK' };
    } catch (error) {
      reply.code(500).send({ error: '系统内部错误' });
    }
  });
}

module.exports = routes;