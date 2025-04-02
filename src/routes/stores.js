const { createStore, updateStore, deleteStore, getStore, getStores } = require('../controllers/stores');
const { storeSchema, updateStoreSchema } = require('../schemas/stores');

async function storeRoutes(fastify, options) {
  // 创建店铺
  fastify.post('/stores', {
    schema: {
      description: '创建新店铺',
      tags: ['店铺管理'],
      body: storeSchema,
      response: {
        201: {
          type: 'object',
          description: '店铺创建成功',
          properties: {
            id: { type: 'number', description: '店铺ID' },
            name: { type: 'string', description: '店铺名称' },
            location: { type: 'string', description: '店铺位置' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
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
    handler: createStore
  });

  // 获取店铺列表
  fastify.get('/stores', {
    schema: {
      description: '获取所有店铺列表',
      tags: ['店铺管理'],
      response: {
        200: {
          type: 'array',
          description: '店铺列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '店铺ID' },
              name: { type: 'string', description: '店铺名称' },
              location: { type: 'string', description: '店铺位置' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
            }
          }
        }
      }
    },
    handler: getStores
  });

  // 获取单个店铺信息
  fastify.get('/stores/:id', {
    schema: {
      description: '获取单个店铺详细信息',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '店铺ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '店铺信息',
          properties: {
            id: { type: 'number', description: '店铺ID' },
            name: { type: 'string', description: '店铺名称' },
            location: { type: 'string', description: '店铺位置' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        404: {
          type: 'object',
          description: '店铺不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: getStore
  });

  // 更新店铺信息
  fastify.put('/stores/:id', {
    schema: {
      description: '更新店铺信息',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '店铺ID' }
        }
      },
      body: updateStoreSchema,
      response: {
        200: {
          type: 'object',
          description: '更新成功',
          properties: {
            id: { type: 'number', description: '店铺ID' },
            name: { type: 'string', description: '店铺名称' },
            location: { type: 'string', description: '店铺位置' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        404: {
          type: 'object',
          description: '店铺不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: updateStore
  });

  // 删除店铺
  fastify.delete('/stores/:id', {
    schema: {
      description: '删除店铺',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '店铺ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '删除成功',
          properties: {
            message: { type: 'string', description: '成功信息' }
          }
        },
        404: {
          type: 'object',
          description: '店铺不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: deleteStore
  });

  // 获取店铺的座位列表
  fastify.get('/stores/:storeId/seats', {
    schema: {
      description: '获取店铺的座位列表',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['storeId'],
        properties: {
          storeId: { type: 'string', description: '店铺ID' }
        }
      },
      response: {
        200: {
          type: 'array',
          description: '座位列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '座位ID' },
              storeId: { type: 'number', description: '店铺ID' },
              seatNumber: { type: 'string', description: '座位号' },
              status: { type: 'string', description: '座位状态' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
            }
          }
        },
        500: {
          type: 'object',
          description: '获取失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { storeId } = request.params;
      try {
        const seats = await fastify.prisma.seat.findMany({
          where: { storeId: parseInt(storeId) },
          orderBy: { seatNumber: 'asc' }
        });
        return reply.send(seats);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: '获取座位列表失败' });
      }
    }
  });

  // 获取店铺的服务列表
  fastify.get('/stores/:storeId/services', {
    schema: {
      description: '获取店铺的服务列表',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['storeId'],
        properties: {
          storeId: { type: 'string', description: '店铺ID' }
        }
      },
      response: {
        200: {
          type: 'array',
          description: '服务列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '服务ID' },
              storeId: { type: 'number', description: '店铺ID' },
              name: { type: 'string', description: '服务名称' },
              description: { type: 'string', description: '服务描述' },
              price: { type: 'number', description: '服务价格' },
              duration: { type: 'number', description: '服务时长(分钟)' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
            }
          }
        },
        500: {
          type: 'object',
          description: '获取失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { storeId } = request.params;
      try {
        const services = await fastify.prisma.service.findMany({
          where: { storeId: parseInt(storeId) },
          orderBy: { name: 'asc' }
        });
        return reply.send(services);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: '获取服务列表失败' });
      }
    }
  });
}

module.exports = storeRoutes;