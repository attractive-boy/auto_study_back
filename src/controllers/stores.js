const dayjs = require('dayjs');

async function createStore(request, reply) {
  const { images, totalSeats, longitude = 0, latitude = 0, ...storeData } = request.body;

  try {
    request.log.info('开始创建店铺', { storeData });
    // 创建店铺并同时创建轮播图和座位
    const store = await this.prisma.store.create({
      data: {
        ...storeData,
        longitude,
        latitude,
        totalSeats,
        availableSeats: totalSeats, // 初始可用座位数等于总座位数
        storeImages: images ? {
          create: images.map(image => ({
            imageUrl: image.imageUrl,
            sortOrder: image.sortOrder,
            isActive: true
          }))
        } : undefined,
        seats: {
          create: Array.from({ length: totalSeats }, (_, index) => ({
            seatNumber: `${index + 1}`,
            status: '可预约'
          }))
        }
      },
      include: {
        storeImages: true,
        seats: true
      }
    });

    request.log.info('店铺创建成功', { storeId: store.id });
    return reply.code(201).send(store);
  } catch (error) {
    request.log.error('创建店铺失败', {
      error: error.message,
      stack: error.stack,
      storeData
    });
    return reply.code(400).send({ 
      error: '创建店铺失败',
      details: error.message
    });
  }
}

async function getStores(request, reply) {
  try {
    const stores = await this.prisma.store.findMany({
      include: {
        storeImages: true
      }
    });
    const result = stores.map(store => ({
      ...store,
      storeImages: store.storeImages
        .filter(img => img.isActive === true)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }));
    return reply.send(result);
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
        storeImages: true
      }
    });
    
    if (!store) {
      return reply.code(404).send({ error: '店铺不存在' });
    }

    const result = {
      ...store,
      storeImages: store.storeImages
        .filter(img => img.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    };

    return reply.send(result);
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

async function getStoreSeats(request, reply) {
  const { storeId } = request.params;
  try {
    const seats = await this.prisma.seat.findMany({
      where: { storeId: parseInt(storeId) },
      orderBy: { seatNumber: 'asc' }
    });
    return reply.send(seats);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取座位列表失败' });
  }
}

async function getStoreServices(request, reply) {
  const { storeId } = request.params;
  try {
    const services = await this.prisma.service.findMany({
      where: { storeId: parseInt(storeId) },
      orderBy: { name: 'asc' }
    });
    return reply.send(services);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取服务列表失败' });
  }
}

module.exports = {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
  getStoreSeats,
  getStoreServices
};