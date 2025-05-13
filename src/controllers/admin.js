const bcrypt = require('bcrypt');

async function adminLogin(request, reply) {
  const { username, password } = request.body;
  
  try {
    // 从数据库查询管理员信息
    const admin = await this.prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return reply.code(401).send({ error: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return reply.code(401).send({ error: '用户名或密码错误' });
    }

    // 使用 fastify.jwt 生成 token
    const token = this.fastify.jwt.sign(
      { 
        id: admin.id,
        username: admin.username,
        role: 'admin'
      }
    );

    return reply.code(200).send({
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '服务器内部错误' });
  }
}

// 创建管理员账号
async function createAdmin(request, reply) {
  const { username, password } = request.body;
  
  try {
    // 检查用户名是否已存在
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      return reply.code(400).send({ error: '用户名已存在' });
    }

    // 对密码进行加密
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建新管理员
    const admin = await this.prisma.admin.create({
      data: {
        username,
        passwordHash
      }
    });

    return reply.code(201).send({
      id: admin.id,
      username: admin.username
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '服务器内部错误' });
  }
}

module.exports = {
  adminLogin,
  createAdmin
}; 