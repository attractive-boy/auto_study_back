const { createMembership, updateMembership, deleteMembership, getMembership, getMemberships } = require('../controllers/memberships');
const { membershipSchema, updateMembershipSchema } = require('../schemas/memberships');

async function membershipRoutes(fastify, options) {
  // 创建会员
  fastify.post('/memberships', {
    schema: {
      description: '创建新会员',
      tags: ['会员管理'],
      body: membershipSchema,
      response: {
        201: {
          type: 'object',
          description: '会员创建成功',
          properties: {
            id: { type: 'number', description: '会员ID' },
            userId: { type: 'number', description: '用户ID' },
            membershipType: { type: 'string', description: '会员类型' },
            balance: { type: 'number', description: '余额' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            expiresAt: { type: 'string', format: 'date-time', description: '过期时间' }
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
    preHandler: [fastify.authenticate],
    handler: createMembership
  });

  // 获取会员列表
  fastify.get('/memberships', {
    schema: {
      description: '获取所有会员列表',
      tags: ['会员管理'],
      response: {
        200: {
          type: 'array',
          description: '会员列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '会员ID' },
              userId: { type: 'number', description: '用户ID' },
              membershipType: { type: 'string', description: '会员类型' },
              balance: { type: 'number', description: '余额' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              expiresAt: { type: 'string', format: 'date-time', description: '过期时间' }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getMemberships
  });

  // 获取单个会员信息
  fastify.get('/memberships/:id', {
    schema: {
      description: '获取指定会员信息',
      tags: ['会员管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '会员ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '会员信息',
          properties: {
            id: { type: 'number', description: '会员ID' },
            userId: { type: 'number', description: '用户ID' },
            membershipType: { type: 'string', description: '会员类型' },
            balance: { type: 'number', description: '余额' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            expiresAt: { type: 'string', format: 'date-time', description: '过期时间' }
          }
        },
        404: {
          type: 'object',
          description: '会员不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getMembership
  });

  // 更新会员信息
  fastify.put('/memberships/:id', {
    schema: {
      description: '更新会员信息',
      tags: ['会员管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '会员ID' }
        }
      },
      body: updateMembershipSchema,
      response: {
        200: {
          type: 'object',
          description: '更新成功',
          properties: {
            id: { type: 'number', description: '会员ID' },
            userId: { type: 'number', description: '用户ID' },
            membershipType: { type: 'string', description: '会员类型' },
            balance: { type: 'number', description: '余额' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            expiresAt: { type: 'string', format: 'date-time', description: '过期时间' }
          }
        },
        404: {
          type: 'object',
          description: '会员不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: updateMembership
  });

  // 删除会员
  fastify.delete('/memberships/:id', {
    schema: {
      description: '删除指定会员',
      tags: ['会员管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '会员ID' }
        }
      },
      response: {
        204: {
          type: 'null',
          description: '删除成功'
        },
        404: {
          type: 'object',
          description: '会员不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: deleteMembership
  });

  // 获取用户的会员信息
  fastify.get('/users/:userId/memberships', {
    schema: {
      description: '获取指定用户的会员信息',
      tags: ['会员管理'],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: '用户ID' }
        }
      },
      response: {
        200: {
          type: 'array',
          description: '用户的会员列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '会员ID' },
              userId: { type: 'number', description: '用户ID' },
              membershipType: { type: 'string', description: '会员类型' },
              balance: { type: 'number', description: '余额' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              expiresAt: { type: 'string', format: 'date-time', description: '过期时间' }
            }
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
    handler: async (request, reply) => {
      request.params.userId = parseInt(request.params.userId);
      return getMemberships(request, reply);
    }
  });
}

module.exports = membershipRoutes;