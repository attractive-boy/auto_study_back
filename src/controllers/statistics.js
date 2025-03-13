const dayjs = require('dayjs');

async function createDailyStatistics(request, reply) {
  try {
    const today = dayjs().startOf('day');
    
    // 获取今日数据
    const [totalUsers, newUsers, totalOrders, newOrders, totalMembers, newMembers] = await Promise.all([
      // 总用户数
      this.prisma.user.count(),
      // 新增用户数
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: today.toDate(),
            lt: today.add(1, 'day').toDate()
          }
        }
      }),
      // 总订单数
      this.prisma.order.count(),
      // 新增订单数
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: today.toDate(),
            lt: today.add(1, 'day').toDate()
          }
        }
      }),
      // 总会员数
      this.prisma.membership.count(),
      // 新增会员数
      this.prisma.membership.count({
        where: {
          createdAt: {
            gte: today.toDate(),
            lt: today.add(1, 'day').toDate()
          }
        }
      })
    ]);

    // 创建或更新统计记录
    const statistics = await this.prisma.statistics.upsert({
      where: {
        statDate: today.toDate()
      },
      update: {
        totalUsers,
        newUsers,
        totalOrders,
        newOrders,
        totalMembers,
        newMembers
      },
      create: {
        statDate: today.toDate(),
        totalUsers,
        newUsers,
        totalOrders,
        newOrders,
        totalMembers,
        newMembers
      }
    });

    return reply.send(statistics);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '创建统计数据失败' });
  }
}

async function getStatistics(request, reply) {
  const { startDate, endDate } = request.query;
  try {
    const where = {};
    if (startDate) {
      where.statDate = {
        ...where.statDate,
        gte: new Date(startDate)
      };
    }
    if (endDate) {
      where.statDate = {
        ...where.statDate,
        lte: new Date(endDate)
      };
    }

    const statistics = await this.prisma.statistics.findMany({
      where,
      orderBy: {
        statDate: 'desc'
      }
    });

    return reply.send(statistics);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取统计数据失败' });
  }
}

async function getRevenueStatistics(request, reply) {
  const { startDate, endDate } = request.query;
  try {
    const where = {};
    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate)
      };
    }
    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate)
      };
    }

    // 获取收益明细
    const reconciliations = await this.prisma.reconciliation.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 按类型统计收益
    const revenueByType = reconciliations.reduce((acc, curr) => {
      if (!acc[curr.type]) {
        acc[curr.type] = 0;
      }
      acc[curr.type] += curr.amount;
      return acc;
    }, {});

    // 计算总收益
    const totalRevenue = reconciliations.reduce((sum, curr) => sum + curr.amount, 0);

    return reply.send({
      totalRevenue,
      revenueByType,
      details: reconciliations
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取收益统计失败' });
  }
}

async function getStoreUsageStatistics(request, reply) {
  const { startDate, endDate } = request.query;
  try {
    const where = {};
    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate)
      };
    }
    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate)
      };
    }

    // 获取各店铺订单数量
    const ordersByStore = await this.prisma.order.groupBy({
      by: ['storeId'],
      where,
      _count: {
        _all: true
      }
    });

    // 获取店铺详情
    const stores = await this.prisma.store.findMany();
    const storeMap = stores.reduce((acc, store) => {
      acc[store.id] = store;
      return acc;
    }, {});

    // 合并数据
    const storeStatistics = ordersByStore.map(stat => ({
      store: storeMap[stat.storeId],
      orderCount: stat._count._all
    }));

    return reply.send(storeStatistics);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取店铺使用统计失败' });
  }
}

module.exports = {
  createDailyStatistics,
  getStatistics,
  getRevenueStatistics,
  getStoreUsageStatistics
};