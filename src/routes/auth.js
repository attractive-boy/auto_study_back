const { hash, compare } = require('bcrypt');
// const passport = require('@fastify/passport');
// const FacebookStrategy = require('passport-facebook').Strategy;
const { logger } = require('../config/logger');

async function authRoutes(fastify, options) {
  // 配置Facebook登录策略
  // await fastify.register(passport);
  
  // const facebookStrategy = new FacebookStrategy({
  //   clientID: process.env.FACEBOOK_APP_ID,
  //   clientSecret: process.env.FACEBOOK_APP_SECRET,
  //   callbackURL: '/auth/facebook/callback',
  //   profileFields: ['id', 'emails', 'name']
  // }, async (accessToken, refreshToken, profile, done) => {
  //   try {
  //     let user = await fastify.prisma.user.findUnique({
  //       where: { facebookId: profile.id }
  //     });

  //     if (!user) {
  //       user = await fastify.prisma.user.create({
  //         data: {
  //           facebookId: profile.id,
  //           email: profile.emails[0].value,
  //           name: `${profile.name.givenName} ${profile.name.familyName}`,
  //           password: await hash(Math.random().toString(36), 10)
  //         }
  //       });
  //     }

  //     done(null, user);
  //   } catch (error) {
  //     done(error);
  //   }
  // });

  // passport.use(facebookStrategy);

  // // Facebook登录路由
  // fastify.get('/auth/facebook', {
  //   schema: {
  //     description: 'Facebook登录接口',
  //     tags: ['认证'],
  //     response: {
  //       302: {
  //         type: 'null',
  //         description: '重定向到Facebook授权页面'
  //       }
  //     }
  //   }
  // }, passport.authenticate('facebook', { scope: ['email'] }));

  // // Facebook登录回调路由
  // fastify.get('/auth/facebook/callback', {
  //   schema: {
  //     description: 'Facebook登录回调接口',
  //     tags: ['认证'],
  //     response: {
  //       200: {
  //         type: 'object',
  //         properties: {
  //           token: { type: 'string', description: 'JWT认证令牌' },
  //           user: {
  //             type: 'object',
  //             properties: {
  //               id: { type: 'number', description: '用户ID' },
  //               email: { type: 'string', description: '用户邮箱' },
  //               name: { type: 'string', description: '用户名称' }
  //             }
  //           }
  //         }
  //       },
  //       401: {
  //         type: 'object',
  //         properties: {
  //           error: { type: 'string', description: '错误信息' }
  //         }
  //       }
  //     }
  //   }
  // }, async (request, reply) => {
  //   try {
  //     const user = await new Promise((resolve, reject) => {
  //       passport.authenticate('facebook', { session: false }, (err, user) => {
  //         if (err) reject(err);
  //         resolve(user);
  //       })(request, reply);
  //     });

  //     if (!user) {
  //       return reply.code(401).send({ error: 'Facebook登录失败' });
  //     }

  //     const token = fastify.jwt.sign({ id: user.id });
  //     reply.send({ token, user: { id: user.id, email: user.email, name: user.name } });
  //   } catch (error) {
  //     request.log.error(error);
  //     reply.code(401).send({ error: 'Facebook登录失败' });
  //   }
  // });

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
          passwordHash: hashedPassword,
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
        logger.error(error);
        throw error;
      }
    }
  });

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