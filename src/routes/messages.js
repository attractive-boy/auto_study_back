const { createMessage, updateMessage, deleteMessage, getMessage, getMessages, getUserMessages } = require('../controllers/messages');
const { messageSchema, updateMessageSchema } = require('../schemas/messages');

async function messageRoutes(fastify, options) {
  // 创建消息
  fastify.post('/messages', {
    schema: {
      description: '创建新消息',
      tags: ['消息管理'],
      body: messageSchema,
      response: {
        201: {
          type: 'object',
          description: '消息创建成功',
          properties: {
            id: { type: 'number', description: '消息ID' },
            userId: { type: 'number', description: '用户ID' },
            messageType: { type: 'string', description: '消息类型' },
            content: { type: 'string', description: '消息内容' },
            isRead: { type: 'boolean', description: '是否已读' },
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
    handler: createMessage
  });

  // 获取所有消息
  fastify.get('/messages', {
    schema: {
      description: '获取所有消息列表',
      tags: ['消息管理'],
      response: {
        200: {
          type: 'array',
          description: '消息列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '消息ID' },
              userId: { type: 'number', description: '用户ID' },
              messageType: { type: 'string', description: '消息类型' },
              content: { type: 'string', description: '消息内容' },
              isRead: { type: 'boolean', description: '是否已读' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getMessages
  });

  // 获取单个消息
  fastify.get('/messages/:id', {
    schema: {
      description: '获取单个消息详情',
      tags: ['消息管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '消息ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '消息详情',
          properties: {
            id: { type: 'number', description: '消息ID' },
            userId: { type: 'number', description: '用户ID' },
            messageType: { type: 'string', description: '消息类型' },
            content: { type: 'string', description: '消息内容' },
            isRead: { type: 'boolean', description: '是否已读' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
          }
        },
        404: {
          type: 'object',
          description: '消息不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: getMessage
  });

  // 更新消息状态
  fastify.put('/messages/:id', {
    schema: {
      description: '更新消息状态',
      tags: ['消息管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '消息ID' }
        }
      },
      body: updateMessageSchema,
      response: {
        200: {
          type: 'object',
          description: '更新成功',
          properties: {
            id: { type: 'number', description: '消息ID' },
            isRead: { type: 'boolean', description: '是否已读' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        404: {
          type: 'object',
          description: '消息不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: updateMessage
  });

  // 删除消息
  fastify.delete('/messages/:id', {
    preHandler: [fastify.authenticate],
    handler: deleteMessage
  });

  // 获取用户的消息列表
  fastify.get('/users/:userId/messages', {
    preHandler: [fastify.authenticate],
    handler: getUserMessages
  });

  // 标记用户所有消息为已读
  fastify.put('/users/:userId/messages/read-all', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { userId } = request.params;
      try {
        await fastify.prisma.message.updateMany({
          where: {
            userId: parseInt(userId),
            isRead: false
          },
          data: {
            isRead: true
          }
        });
        return reply.send({ success: true });
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: '更新消息状态失败' });
      }
    }
  });
}

module.exports = messageRoutes;