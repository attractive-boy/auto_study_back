const dayjs = require('dayjs');

async function createMembership(request, reply) {
  const { userId, membershipType, balance, expiresAt } = request.body;
  try {
    const membership = await this.prisma.membership.create({
      data: {
        userId,
        membershipType,
        balance,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });
    return reply.code(201).send(membership);
  } catch (error) {
    if (error.code === 'P2003') {
      return reply.code(400).send({ error: '用户不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '创建会员失败' });
  }
}

async function getMemberships(request, reply) {
  const { userId } = request.params;
  try {
    const query = userId ? { where: { userId: parseInt(userId) } } : {};
    const memberships = await this.prisma.membership.findMany({
      ...query,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    return reply.send(memberships);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取会员列表失败' });
  }
}

async function getMembership(request, reply) {
  const { id } = request.params;
  try {
    const membership = await this.prisma.membership.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!membership) {
      return reply.code(404).send({ error: '会员信息不存在' });
    }
    return reply.send(membership);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取会员信息失败' });
  }
}

async function updateMembership(request, reply) {
  const { id } = request.params;
  const updateData = request.body;
  
  try {
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }
    
    const membership = await this.prisma.membership.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    return reply.send(membership);
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '会员信息不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '更新会员信息失败' });
  }
}

async function deleteMembership(request, reply) {
  const { id } = request.params;
  try {
    await this.prisma.membership.delete({
      where: { id: parseInt(id) }
    });
    return reply.code(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '会员信息不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '删除会员信息失败' });
  }
}

module.exports = {
  createMembership,
  getMemberships,
  getMembership,
  updateMembership,
  deleteMembership
};