const { createOrder, updateOrder, deleteOrder, getOrder, getOrders } = require('../controllers/orders');

async function orderRoutes(fastify, options) {
  // 创建订单
  fastify.post('/orders', {
    schema: {
      description: '创建新订单',
      tags: ['订单管理'],
      body: {
        type: 'object',
        required: ['userId', 'storeId', 'orderStartTime', 'orderEndTime'],
        properties: {
          userId: { type: 'number', description: '用户ID' },
          storeId: { type: 'number', description: '店铺ID' },
          seatId: { type: 'number', description: '座位ID' },
          serviceId: { type: 'number', description: '服务ID' },
          orderStartTime: { type: 'string', format: 'date-time', description: '预约开始时间' },
          orderEndTime: { type: 'string', format: 'date-time', description: '预约结束时间' }
        }
      },
      response: {
        201: {
          type: 'object',
          description: '订单创建成功',
          properties: {
            id: { type: 'number', description: '订单ID' },
            userId: { type: 'number', description: '用户ID' },
            storeId: { type: 'number', description: '店铺ID' },
            seatId: { type: 'number', description: '座位ID' },
            serviceId: { type: 'number', description: '服务ID' },
            status: { type: 'string', description: '订单状态' },
            orderStartTime: { type: 'string', format: 'date-time', description: '预约开始时间' },
            orderEndTime: { type: 'string', format: 'date-time', description: '预约结束时间' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
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
    handler: createOrder
  });

  // 获取订单列表
  fastify.get('/orders', {
    schema: {
      description: '获取所有订单列表',
      tags: ['订单管理'],
      response: {
        200: {
          type: 'array',
          description: '订单列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '订单ID' },
              userId: { type: 'number', description: '用户ID' },
              storeId: { type: 'number', description: '店铺ID' },
              seatId: { type: 'number', description: '座位ID' },
              serviceId: { type: 'number', description: '服务ID' },
              status: { type: 'string', description: '订单状态' },
              orderStartTime: { type: 'string', format: 'date-time', description: '预约开始时间' },
              orderEndTime: { type: 'string', format: 'date-time', description: '预约结束时间' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              user: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: '用户名称' },
                  email: { type: 'string', description: '用户邮箱' }
                }
              },
              store: { type: 'object', description: '店铺信息' },
              seat: { type: 'object', description: '座位信息' },
              service: { type: 'object', description: '服务信息' },
              payment: { type: 'object', description: '支付信息' }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getOrders
  });

  // 获取单个订单
  fastify.get('/orders/:id', {
    schema: {
      description: '获取指定订单信息',
      tags: ['订单管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '订单ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '订单信息',
          properties: {
            id: { type: 'number', description: '订单ID' },
            userId: { type: 'number', description: '用户ID' },
            storeId: { type: 'number', description: '店铺ID' },
            seatId: { type: 'number', description: '座位ID' },
            serviceId: { type: 'number', description: '服务ID' },
            status: { type: 'string', description: '订单状态' },
            orderStartTime: { type: 'string', format: 'date-time', description: '预约开始时间' },
            orderEndTime: { type: 'string', format: 'date-time', description: '预约结束时间' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            user: {
              type: 'object',
              properties: {
                name: { type: 'string', description: '用户名称' },
                email: { type: 'string', description: '用户邮箱' }
              }
            },
            store: { type: 'object', description: '店铺信息' },
            seat: { type: 'object', description: '座位信息' },
            service: { type: 'object', description: '服务信息' },
            payment: { type: 'object', description: '支付信息' }
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
    handler: getOrder
  });

  // 获取用户的订单列表
  fastify.get('/users/:userId/orders', {
    schema: {
      description: '获取指定用户的订单列表',
      tags: ['订单管理'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', description: '用户ID' }
        }
      },
      response: {
        200: {
          type: 'array',
          description: '用户订单列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '订单ID' },
              storeId: { type: 'number', description: '店铺ID' },
              seatId: { type: 'number', description: '座位ID' },
              serviceId: { type: 'number', description: '服务ID' },
              status: { type: 'string', description: '订单状态' },
              orderStartTime: { type: 'string', format: 'date-time', description: '预约开始时间' },
              orderEndTime: { type: 'string', format: 'date-time', description: '预约结束时间' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              store: { type: 'object', description: '店铺信息' },
              seat: { type: 'object', description: '座位信息' },
              service: { type: 'object', description: '服务信息' },
              payment: { type: 'object', description: '支付信息' }
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
      const { userId } = request.params;
      try {
        const orders = await fastify.prisma.order.findMany({
          where: { userId: parseInt(userId) },
          include: {
            store: true,
            seat: true,
            service: true,
            payment: true
          },
          orderBy: { createdAt: 'desc' }
        });
        return reply.send(orders);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: '获取用户订单列表失败' });
      }
    }
  });
}

module.exports = orderRoutes;