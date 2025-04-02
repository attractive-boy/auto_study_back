const dayjs = require('dayjs');

async function createStore(request, reply) {
  const { name, location } = request.body;
  try {
    const store = await this.prisma.store.create({
      data: {
        name,
        location
      }
    });
    return reply.code(201).send(store);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '创建店铺失败' });
  }
}

async function getStores(request, reply) {
  try {
    const stores = await this.prisma.store.findMany({
      include: {
        seats: true,
        services: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return reply.send(stores);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取店铺列表失败' });
  }
}

async function getStore(request, reply) {
  const { id } = request.params;
  try {
    const store = await this.prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: {
        seats: true,
        services: true
      }
    });
    
    if (!store) {
      return reply.code(404).send({ error: '店铺不存在' });
    }
    return reply.send(store);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取店铺信息失败' });
  }
}

async function updateStore(request, reply) {
  const { id } = request.params;
  const updateData = request.body;
  
  try {
    const store = await this.prisma.store.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    return reply.send(store);
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '店铺不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '更新店铺信息失败' });
  }
}

async function deleteStore(request, reply) {
  const { id } = request.params;
  try {
    await this.prisma.store.delete({
      where: { id: parseInt(id) }
    });
    return reply.code(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '店铺不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '删除店铺失败' });
  }
}

module.exports = {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore
};