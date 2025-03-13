const membershipSchema = {
  type: 'object',
  required: ['userId', 'membershipType'],
  properties: {
    userId: {
      type: 'number',
      description: '用户ID'
    },
    membershipType: {
      type: 'string',
      description: '会员类型'
    },
    balance: {
      type: 'number',
      minimum: 0,
      description: '会员余额'
    },
    expiresAt: {
      type: 'string',
      format: 'date-time',
      description: '会员过期时间'
    }
  }
};

const updateMembershipSchema = {
  type: 'object',
  properties: {
    membershipType: {
      type: 'string',
      description: '会员类型'
    },
    balance: {
      type: 'number',
      minimum: 0,
      description: '会员余额'
    },
    expiresAt: {
      type: 'string',
      format: 'date-time',
      description: '会员过期时间'
    }
  }
};

module.exports = {
  membershipSchema,
  updateMembershipSchema
};