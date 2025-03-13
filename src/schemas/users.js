const userSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: '用户邮箱'
    },
    password: {
      type: 'string',
      minLength: 6,
      description: '用户密码'
    },
    name: {
      type: 'string',
      description: '用户名称'
    },
    avatar: {
      type: 'string',
      description: '用户头像URL'
    },
    facebookId: {
      type: 'string',
      description: 'Facebook账号ID'
    }
  }
};

const updateUserSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '用户名称'
    },
    password: {
      type: 'string',
      minLength: 6,
      description: '用户密码'
    },
    avatar: {
      type: 'string',
      description: '用户头像URL'
    },
    facebookId: {
      type: 'string',
      description: 'Facebook账号ID'
    }
  }
};

module.exports = {
  userSchema,
  updateUserSchema
};