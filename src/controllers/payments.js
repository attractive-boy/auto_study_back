const dayjs = require('dayjs');

async function createPayment(request, reply) {
  const { orderId, amount, paymentMethod } = request.body;
  try {
    // 检查订单是否存在
    const order = await this.prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { payment: true }
    });

    if (!order) {
      return reply.code(404).send({ error: '订单不存在' });
    }

    if (order.payment) {
      return reply.code(400).send({ error: '该订单已创建支付记录' });
    }

    // 创建支付记录
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount,
        paymentMethod,
        paymentStatus: '待支付',
        transactionTime: new Date()
      }
    });

    // TODO: 调用第三方支付接口，获取支付链接或二维码
    // const paymentUrl = await thirdPartyPayment.createPayment(payment);

    return reply.code(201).send(payment);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '创建支付记录失败' });
  }
}

async function handlePaymentCallback(request, reply) {
  const { paymentId, status, transactionId } = request.body;
  try {
    // 更新支付记录状态
    const payment = await this.prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paymentStatus: status,
        updatedAt: new Date()
      },
      include: {
        order: true
      }
    });

    // 如果支付成功，更新订单状态
    if (status === '已支付') {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: '待使用' }
      });

      // 创建收益记录
      await this.prisma.reconciliation.create({
        data: {
          type: '服务套餐收益',
          amount: payment.amount,
          orderId: payment.orderId
        }
      });
    }

    return reply.send(payment);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '处理支付回调失败' });
  }
}

async function getPaymentStatus(request, reply) {
  const { id } = request.params;
  try {
    const payment = await this.prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            store: true,
            service: true
          }
        }
      }
    });

    if (!payment) {
      return reply.code(404).send({ error: '支付记录不存在' });
    }

    return reply.send(payment);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取支付状态失败' });
  }
}

async function refundPayment(request, reply) {
  const { paymentId, refundAmount, reason } = request.body;
  try {
    const payment = await this.prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: { order: true }
    });

    if (!payment) {
      return reply.code(404).send({ error: '支付记录不存在' });
    }

    if (payment.paymentStatus !== '已支付') {
      return reply.code(400).send({ error: '该支付记录状态不可退款' });
    }

    if (refundAmount > payment.amount) {
      return reply.code(400).send({ error: '退款金额不能大于支付金额' });
    }

    // TODO: 调用第三方支付接口进行退款
    // const refundResult = await thirdPartyPayment.refund(payment, refundAmount);

    // 更新支付记录状态
    const updatedPayment = await this.prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paymentStatus: '已退款',
        updatedAt: new Date()
      }
    });

    // 创建退款收益记录（负数）
    await this.prisma.reconciliation.create({
      data: {
        type: '退款',
        amount: -refundAmount,
        orderId: payment.orderId
      }
    });

    return reply.send(updatedPayment);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '处理退款失败' });
  }
}

module.exports = {
  createPayment,
  handlePaymentCallback,
  getPaymentStatus,
  refundPayment
};