const dayjs = require('dayjs');

async function createOrder(request, reply) {
  const { userId, storeId, seatId, serviceId, orderStartTime, orderEndTime } = request.body;
  try {
    // 检查座位是否可用
    if (seatId) {
      const existingReservation = await this.prisma.reservationLog.findFirst({
        where: {
          seatId,
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(orderStartTime) } },
                { endTime: { gt: new Date(orderStartTime) } }
              ]
            },
            {
              AND: [
                { startTime: { lt: new Date(orderEndTime) } },
                { endTime: { gte: new Date(orderEndTime) } }
              ]
            }
          ]
        }
      });

      if (existingReservation) {
        return reply.code(400).send({ error: '该时段座位已被预约' });
      }
    }

    // 创建订单
    const order = await this.prisma.order.create({
      data: {
        userId,
        storeId,
        seatId,
        serviceId,
        status: '待付款',
        orderStartTime: new Date(orderStartTime),
        orderEndTime: new Date(orderEndTime)
      },
      include: {
        store: true,
        seat: true,
        service: true
      }
    });

    // 如果有座位，创建预约记录
    if (seatId) {
      await this.prisma.reservationLog.create({
        data: {
          userId,
          orderId: order.id,
          seatId,
          startTime: new Date(orderStartTime),
          endTime: new Date(orderEndTime)
        }
      });
    }

    return reply.code(201).send(order);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '创建订单失败' });
  }
}

async function getOrders(request, reply) {
  try {
    const orders = await this.prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        store: true,
        seat: true,
        service: true,
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return reply.send(orders);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取订单列表失败' });
  }
}

async function getOrder(request, reply) {
  const { id } = request.params;
  try {
    const order = await this.prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        store: true,
        seat: true,
        service: true,
        payment: true,
        reservationLogs: true
      }
    });
    
    if (!order) {
      return reply.code(404).send({ error: '订单不存在' });
    }
    return reply.send(order);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取订单信息失败' });
  }
}

async function updateOrderStatus(request, reply) {
  const { id } = request.params;
  const { status } = request.body;
  
  try {
    const order = await this.prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        store: true,
        seat: true,
        service: true,
        payment: true
      }
    });
    
    return reply.send(order);
  } catch (error) {
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: '订单不存在' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: '更新订单状态失败' });
  }
}

async function cancelOrder(request, reply) {
  const { id } = request.params;
  try {
    const order = await this.prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return reply.code(404).send({ error: '订单不存在' });
    }

    if (order.status === '已完成' || order.status === '已取消') {
      return reply.code(400).send({ error: '该订单状态不可取消' });
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: '已取消' },
      include: {
        payment: true
      }
    });

    // 如果订单已支付，创建退款记录
    if (updatedOrder.payment && updatedOrder.payment.paymentStatus === '已支付') {
      // TODO: 处理退款逻辑
    }

    // 删除预约记录
    await this.prisma.reservationLog.deleteMany({
      where: { orderId: parseInt(id) }
    });

    return reply.send(updatedOrder);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '取消订单失败' });
  }
}

async function getUserOrders(request, reply) {
  const { userId } = request.params;
  try {
    const orders = await this.prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        store: true,
        seat: true,
        service: true,
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return reply.send(orders);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取用户订单列表失败' });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getUserOrders
};