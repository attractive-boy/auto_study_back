const { hash, compare } = require('bcrypt');

async function authRoutes(fastify, options) {
  const { prisma } = fastify;

  // 用户注册
  fastify.post('/register', {
    schema: {
      description: '用户注册接口',
      tags: ['认证'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: '用户邮箱' },
          password: { type: 'string', description: '用户密码' },
          name: { type: 'string', description: '用户名称' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '用户ID' },
            email: { type: 'string', description: '用户邮箱' },
            name: { type: 'string', description: '用户名称' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password, name } = request.body;

    try {
      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      reply.code(201).send(user);
    } catch (error) {
      if (error.code === 'P2002') {
        reply.code(400).send({ error: '该邮箱已被注册' });
      } else {
        throw error;
      }
    }
  });

  // 用户登录
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' }
              }
            }
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

    const valid = await compare(password, user.password);
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