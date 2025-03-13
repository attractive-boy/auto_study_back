const { createUser, updateUser, deleteUser, getUser, getUsers } = require('../controllers/users');
const { userSchema, updateUserSchema } = require('../schemas/users');

async function userRoutes(fastify, options) {
  // 用户注册
  fastify.post('/users', {
    schema: {
      description: '创建新用户',
      tags: ['用户管理'],
      body: userSchema,
      response: {
        201: {
          type: 'object',
          description: '用户创建成功',
          properties: {
            id: { type: 'number', description: '用户ID' },
            email: { type: 'string', description: '用户邮箱' },
            name: { type: 'string', description: '用户名称' }
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
    handler: createUser
  });

  // 获取用户列表
  fastify.get('/users', {
    schema: {
      description: '获取所有用户列表',
      tags: ['用户管理'],
      response: {
        200: {
          type: 'array',
          description: '用户列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '用户ID' },
              email: { type: 'string', description: '用户邮箱' },
              name: { type: 'string', description: '用户名称' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getUsers
  });

  // 获取单个用户
  fastify.get('/users/:id', {
    schema: {
      description: '获取指定用户信息',
      tags: ['用户管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '用户ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '用户信息',
          properties: {
            id: { type: 'number', description: '用户ID' },
            email: { type: 'string', description: '用户邮箱' },
            name: { type: 'string', description: '用户名称' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        404: {
          type: 'object',
          description: '用户不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getUser
  });

  // 更新用户信息
  fastify.put('/users/:id', {
    schema: {
      description: '更新用户信息',
      tags: ['用户管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '用户ID' }
        }
      },
      body: updateUserSchema,
      response: {
        200: {
          type: 'object',
          description: '更新成功',
          properties: {
            id: { type: 'number', description: '用户ID' },
            email: { type: 'string', description: '用户邮箱' },
            name: { type: 'string', description: '用户名称' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        404: {
          type: 'object',
          description: '用户不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: updateUser
  });

  // 删除用户
  fastify.delete('/users/:id', {
    schema: {
      description: '删除指定用户',
      tags: ['用户管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '用户ID' }
        }
      },
      response: {
        204: {
          type: 'null',
          description: '删除成功'
        },
        404: {
          type: 'object',
          description: '用户不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: deleteUser
  });

}

module.exports = userRoutes;