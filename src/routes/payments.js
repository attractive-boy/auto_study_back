const { createPayment, handlePaymentCallback, getPaymentStatus } = require('../controllers/payments');

async function paymentRoutes(fastify, options) {
  // 创建支付
  fastify.post('/payments', {
    schema: {
      description: '创建支付记录',
      tags: ['支付管理'],
      body: {
        type: 'object',
        required: ['orderId', 'amount', 'paymentMethod'],
        properties: {
          orderId: { type: 'number', description: '订单ID' },
          amount: { type: 'number', description: '支付金额' },
          paymentMethod: { type: 'string', description: '支付方式' }
        }
      },
      response: {
        201: {
          type: 'object',
          description: '支付记录创建成功',
          properties: {
            id: { type: 'number', description: '支付记录ID' },
            orderId: { type: 'number', description: '订单ID' },
            amount: { type: 'number', description: '支付金额' },
            paymentMethod: { type: 'string', description: '支付方式' },
            paymentStatus: { type: 'string', description: '支付状态' },
            transactionTime: { type: 'string', format: 'date-time', description: '交易时间' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
          }
        },
        400: {
          type: 'object',
          description: '创建失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        },
        404: {
          type: 'object',
          description: '订单不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: createPayment
  });

  // 支付回调
  fastify.post('/payments/callback', {
    schema: {
      description: '支付回调接口',
      tags: ['支付管理'],
      body: {
        type: 'object',
        required: ['paymentId', 'status'],
        properties: {
          paymentId: { type: 'number', description: '支付记录ID' },
          status: { type: 'string', description: '支付状态' },
          transactionId: { type: 'string', description: '第三方交易ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '支付状态更新成功',
          properties: {
            id: { type: 'number', description: '支付记录ID' },
            paymentStatus: { type: 'string', description: '支付状态' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
            order: {
              type: 'object',
              properties: {
                id: { type: 'number', description: '订单ID' },
                status: { type: 'string', description: '订单状态' }
              }
            }
          }
        },
        500: {
          type: 'object',
          description: '处理失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: handlePaymentCallback
  });

  // 获取支付状态
  fastify.get('/payments/:id', {
    schema: {
      description: '获取支付状态',
      tags: ['支付管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '支付记录ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '支付记录信息',
          properties: {
            id: { type: 'number', description: '支付记录ID' },
            orderId: { type: 'number', description: '订单ID' },
            amount: { type: 'number', description: '支付金额' },
            paymentMethod: { type: 'string', description: '支付方式' },
            paymentStatus: { type: 'string', description: '支付状态' },
            transactionTime: { type: 'string', format: 'date-time', description: '交易时间' },
            order: {
              type: 'object',
              properties: {
                id: { type: 'number', description: '订单ID' },
                status: { type: 'string', description: '订单状态' },
                store: { type: 'object', description: '店铺信息' },
                service: { type: 'object', description: '服务信息' }
              }
            }
          }
        },
        404: {
          type: 'object',
          description: '支付记录不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getPaymentStatus
  });
}

module.exports = paymentRoutes;