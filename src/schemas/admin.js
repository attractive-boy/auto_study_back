const adminLoginSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { 
      type: 'string',
      minLength: 3,
      maxLength: 50,
      description: '管理员用户名'
    },
    password: { 
      type: 'string',
      minLength: 6,
      maxLength: 100,
      description: '管理员密码'
    }
  }
};

module.exports = {
  adminLoginSchema
}; 