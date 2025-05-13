const { hash, compare } = require('bcrypt');
const smsService = require('../services/smsService');

async function authRoutes(fastify, options) {
  const { prisma } = fastify;

  // 发送验证码
  fastify.post('/send-code', {
    schema: {
      description: '发送手机验证码',
      tags: ['认证'],
      body: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', description: '手机号码' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '发送成功',
          properties: {
            success: { type: 'boolean', description: '是否发送成功' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { phone } = request.body;
    
    const success = await smsService.sendVerificationCode(phone);
    if (!success) {
      reply.code(500).send({ error: '验证码发送失败' });
      return;
    }

    reply.send({ success: true });
  });

  // 用户登录
  fastify.post('/login', {
    schema: {
      description: '用户登录接口',
      tags: ['认证'],
      body: {
        type: 'object',
        required: ['phone', 'code'],
        properties: {
          phone: { type: 'string', description: '手机号码' },
          code: { type: 'string', description: '验证码' }
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
                phone: { type: 'string', description: '手机号码' },
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
    const { phone, code } = request.body;

    // 验证验证码
    const isValidCode = smsService.verifyCode(phone, code);
    if (!isValidCode) {
      reply.code(401).send({ error: '验证码错误或已过期' });
      return;
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // 如果用户不存在，创建新用户
      user = await prisma.user.create({
        data: {
          phone,
          name: `用户${phone.slice(-4)}`, // 使用手机号后4位作为默认用户名
          role: 'user'
        }
      });
    }

    const token = fastify.jwt.sign({ id: user.id });

    reply.send({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  });
}

module.exports = authRoutes;