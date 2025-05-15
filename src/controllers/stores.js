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
            imageName: image.imageName,
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
        storeImages: true,
        seats: {
          select: {
            id: true,
            seatNumber: true,
            status: true
          }
        }
      }
    });
    
    if (!store) {
      return reply.code(404).send({ error: '店铺不存在' });
    }

    const result = {
      ...store,
      storeImages: store.storeImages
        .filter(img => img.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      seats: store.seats,
      services: store.services
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
    // 如果更新数据中包含totalSeats，需要同步调整座位表
    if (updateData.totalSeats !== undefined) {
      // 获取当前店铺信息
      const currentStore = await this.prisma.store.findUnique({
        where: { id: parseInt(id) },
        include: {
          seats: true
        }
      });

      if (!currentStore) {
        return reply.code(404).send({ error: '店铺不存在' });
      }

      const currentSeatCount = currentStore.seats.length;
      const newSeatCount = updateData.totalSeats;

      // 如果新座位数大于当前座位数，需要添加新座位
      if (newSeatCount > currentSeatCount) {
        const seatsToAdd = [];
        for (let i = currentSeatCount + 1; i <= newSeatCount; i++) {
          seatsToAdd.push({
            storeId: parseInt(id),
            seatNumber: `${i}`,
            status: '可预约'
          });
        }
        await this.prisma.seat.createMany({
          data: seatsToAdd
        });
      }
      // 如果新座位数小于当前座位数，需要删除多余的座位
      else if (newSeatCount < currentSeatCount) {
        await this.prisma.seat.deleteMany({
          where: {
            storeId: parseInt(id),
            seatNumber: {
              in: currentStore.seats
                .slice(newSeatCount)
                .map(seat => seat.seatNumber)
            }
          }
        });
      }

      // 更新可用座位数
      updateData.availableSeats = newSeatCount;
    }

    // 更新店铺信息
    const store = await this.prisma.store.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        storeImages: true,
        seats: {
          select: {
            id: true,
            seatNumber: true,
            status: true
          }
        }
      }
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
      select: {
        id: true,
        storeId: true,
        seatNumber: true,
        status: true,
        seatType: true,
        createdAt: true,
        updatedAt: true
      },
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

async function setStoreSeatTypes(request, reply) {
  const { storeId } = request.params;
  const { seatTypes } = request.body;
  
  try {
    // 验证店铺是否存在
    const store = await this.prisma.store.findUnique({
      where: { id: parseInt(storeId) },
      include: {
        seats: true
      }
    });

    if (!store) {
      return reply.code(404).send({ error: '店铺不存在' });
    }

    // 验证座位类型配置
    if (seatTypes.length === 0) {
      return reply.code(400).send({ error: '座位类型配置不能为空' });
    }

    // 验证座位编号是否都存在
    const seatNumbers = store.seats.map(seat => seat.seatNumber);
    const invalidSeats = seatTypes.filter(
      config => !seatNumbers.includes(config.seatNumber)
    );
    
    if (invalidSeats.length > 0) {
      return reply.code(400).send({ 
        error: '存在无效的座位编号',
        invalidSeats: invalidSeats.map(seat => seat.seatNumber)
      });
    }

    // 创建座位编号到ID的映射
    const seatMap = store.seats.reduce((acc, seat) => {
      acc[seat.seatNumber] = seat.id;
      return acc;
    }, {});

    // 批量更新座位类型
    await this.prisma.$transaction(
      seatTypes.map(config => 
        this.prisma.seat.update({
          where: { 
            id: seatMap[config.seatNumber]
          },
          data: { seatType: config.type }
        })
      )
    );

    // 获取更新后的座位列表
    const updatedSeats = await this.prisma.seat.findMany({
      where: { storeId: parseInt(storeId) },
      orderBy: { seatNumber: 'asc' }
    });

    return reply.code(200).send({
      message: '座位类型设置成功',
      seats: updatedSeats
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '设置座位类型失败' });
  }
}

module.exports = {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
  getStoreSeats,
  getStoreServices,
  setStoreSeatTypes
};