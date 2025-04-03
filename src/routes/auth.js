const { hash, compare } = require('bcrypt');

async function authRoutes(fastify, options) {

  const { prisma } = fastify;

  // 用户登录
  fastify.post('/login', {
    schema: {
      description: '用户登录接口',
      tags: ['认证'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: '用户邮箱' },
          password: { type: 'string', description: '用户密码' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '登录成功',
          properties: {
            token: { type: 'string', description: 'JWT认证令牌' },
            user: {
              type: 'object',
              description: '用户信息',
              properties: {
                id: { type: 'number', description: '用户ID' },
                email: { type: 'string', description: '用户邮箱' },
                name: { type: 'string', description: '用户名称' },
                role: { type: 'string', description: '用户角色' }
              }
            }
          }
        },
        401: {
          type: 'object',
          description: '登录失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      reply.code(401).send({ error: '邮箱或密码错误' });
      return;
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      reply.code(401).send({ error: '邮箱或密码错误' });
      return;
    }

    const token = fastify.jwt.sign({ id: user.id });

    reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  });

}

module.exports = authRoutes;