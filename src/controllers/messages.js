const dayjs = require('dayjs');

async function createMessage(request, reply) {
  const { userId, messageType, content } = request.body;
  try {
    const message = await this.prisma.message.create({
      data: {
        userId,
        messageType,
        content,
        isRead: false
      }
    });
    return reply.code(201).send(message);
  } catch (error) {
    if (error.code === 'P2003') {
      return reply.code(400).send({ error: '用户不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '创建消息失败' });
  }
}

async function getMessages(request, reply) {
  try {
    const messages = await this.prisma.message.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return reply.send(messages);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取消息列表失败' });
  }
}

async function getMessage(request, reply) {
  const { id } = request.params;
  try {
    const message = await this.prisma.message.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!message) {
      return reply.code(404).send({ error: '消息不存在' });
    }
    return reply.send(message);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取消息失败' });
  }
}

async function updateMessage(request, reply) {
  const { id } = request.params;
  const updateData = request.body;
  
  try {
    const message = await this.prisma.message.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    return reply.send(message);
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '消息不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '更新消息失败' });
  }
}

async function deleteMessage(request, reply) {
  const { id } = request.params;
  try {
    await this.prisma.message.delete({
      where: { id: parseInt(id) }
    });
    return reply.code(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '消息不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '删除消息失败' });
  }
}

async function getUserMessages(request, reply) {
  const { userId } = request.params;
  try {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { userId: parseInt(userId) },
          { userId: null } // 系统公告
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return reply.send(messages);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取用户消息列表失败' });
  }
}

module.exports = {
  createMessage,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  getUserMessages
};