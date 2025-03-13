const membershipLevelsController = require('../controllers/membershipLevels');

async function membershipLevelsRoutes(fastify) {
  // 会员充值
  fastify.post('/membership/recharge', {
    schema: {
      description: '会员充值',
      tags: ['会员等级管理'],
      body: {
        type: 'object',
        required: ['userId', 'amount'],
        properties: {
          userId: { type: 'integer', description: '用户ID' },
          amount: { type: 'number', minimum: 0, description: '充值金额' }
        }
      },
      response: {
        201: {
          type: 'object',
          description: '充值成功',
          properties: {
            recharge: {
              type: 'object',
              properties: {
                id: { type: 'number', description: '充值记录ID' },
                userId: { type: 'number', description: '用户ID' },
                amount: { type: 'number', description: '充值金额' },
                rechargeStatus: { type: 'string', description: '充值状态' },
                createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
              }
            },
            membership: {
              type: 'object',
              properties: {
                id: { type: 'number', description: '会员ID' },
                balance: { type: 'number', description: '当前余额' },
                expiresAt: { type: 'string', format: 'date-time', description: '过期时间' }
              }
            }
          }
        },
        400: {
          type: 'object',
          description: '充值失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: membershipLevelsController.rechargeMembership
  });

  // 获取充值记录
  fastify.get('/membership/recharge/:userId', {
    schema: {
      description: '获取用户充值记录',
      tags: ['会员等级管理'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', pattern: '^\\d+$', description: '用户ID' }
        }
      },
      response: {
        200: {
          type: 'array',
          description: '充值记录列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '充值记录ID' },
              amount: { type: 'number', description: '充值金额' },
              rechargeStatus: { type: 'string', description: '充值状态' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
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
    handler: membershipLevelsController.getRechargeHistory
  });

  // 获取会员等级信息
  fastify.get('/membership/level/:userId', {
    schema: {
      description: '获取用户会员等级信息',
      tags: ['会员等级管理'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', pattern: '^\\d+$', description: '用户ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '会员等级信息',
          properties: {
            id: { type: 'number', description: '会员ID' },
            userId: { type: 'number', description: '用户ID' },
            membershipType: { type: 'string', description: '会员类型' },
            balance: { type: 'number', description: '当前余额' },
            level: { type: 'string', description: '会员等级' },
            benefits: { type: 'array', items: { type: 'string' }, description: '会员权益' },
            nextLevel: {
              type: 'object',
              nullable: true,
              properties: {
                name: { type: 'string', description: '下一等级名称' },
                requiredBalance: { type: 'number', description: '升级所需余额' }
              },
              description: '下一等级信息'
            },
            expiresAt: { type: 'string', format: 'date-time', description: '过期时间' }
          }
        },
        404: {
          type: 'object',
          description: '会员信息不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: membershipLevelsController.getMembershipLevel
  });
}

module.exports = membershipLevelsRoutes;