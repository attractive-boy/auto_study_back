const { adminLogin, createAdmin } = require('../controllers/admin');
const { adminLoginSchema } = require('../schemas/admin');

async function adminRoutes(fastify, options) {
  // 管理员登录
  fastify.post('/admin/login', {
    schema: {
      description: '管理员登录',
      tags: ['管理员'],
      body: adminLoginSchema,
      response: {
        200: {
          type: 'object',
          description: '登录成功',
          properties: {
            token: { type: 'string', description: 'JWT token' },
            admin: {
              type: 'object',
              properties: {
                id: { type: 'number', description: '管理员ID' },
                username: { type: 'string', description: '管理员用户名' }
              }
            }
          }
        },
        401: {
          type: 'object',
          description: '登录失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: adminLogin
  });

  // 创建管理员
  fastify.post('/admin', {
    schema: {
      description: '创建新管理员',
      tags: ['管理员'],
      body: adminLoginSchema,
      response: {
        201: {
          type: 'object',
          description: '创建成功',
          properties: {
            id: { type: 'number', description: '管理员ID' },
            username: { type: 'string', description: '管理员用户名' }
          }
        },
        400: {
          type: 'object',
          description: '创建失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate], // 需要认证才能创建管理员
    handler: createAdmin
  });
}

module.exports = adminRoutes; 