const bcrypt = require('bcrypt');

async function createUser(request, reply) {
  const { email, password, name } = request.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name
      }
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    return reply.code(201).send(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2002') {
      request.log({
        err: error,
        msg: '邮箱已被注册',
        email
      });
      return reply.code(400).send({ error: '该邮箱已被注册' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '创建用户失败' });
  }
}

async function getUsers(request, reply) {
  try {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return reply.send(users);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取用户列表失败' });
  }
}

async function getUser(request, reply) {
  const { id } = request.params;
  try {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return reply.code(404).send({ error: '用户不存在' });
    }
    return reply.send(user);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取用户信息失败' });
  }
}

async function updateUser(request, reply) {
  const { id } = request.params;
  const updateData = request.body;
  
  try {
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }
    
    const user = await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return reply.send(user);
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '用户不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '更新用户信息失败' });
  }
}

async function deleteUser(request, reply) {
  const { id } = request.params;
  try {
    await this.prisma.user.delete({
      where: { id: parseInt(id) }
    });
    return reply.code(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '用户不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '删除用户失败' });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
};