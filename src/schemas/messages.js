const messageSchema = {
  type: 'object',
  required: ['messageType', 'content'],
  properties: {
    userId: {
      type: 'number',
      description: '用户ID，若为空则为系统公告'
    },
    messageType: {
      type: 'string',
      description: '消息类型'
    },
    content: {
      type: 'string',
      description: '消息内容'
    }
  }
};

const updateMessageSchema = {
  type: 'object',
  properties: {
    messageType: {
      type: 'string',
      description: '消息类型'
    },
    content: {
      type: 'string',
      description: '消息内容'
    },
    isRead: {
      type: 'boolean',
      description: '是否已读'
    }
  }
};

module.exports = {
  messageSchema,
  updateMessageSchema
};