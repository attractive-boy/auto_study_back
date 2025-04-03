const dayjs = require('dayjs');
const qpay = require('../services/qpay');

class PaymentStatusChecker {
  constructor(prisma) {
    this.prisma = prisma;
    this.checkInterval = 5 * 60 * 1000; // 5分钟检查一次
    this.maxCheckTime = 24 * 60 * 60 * 1000; // 最长检查24小时
  }

  async start() {
    setInterval(() => this.checkPendingPayments(), this.checkInterval);
  }

  async checkPendingPayments() {
    try {
      // 获取所有待支付状态的支付记录
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          paymentStatus: '待支付',
          qpayInvoiceId: { not: null },
          transactionTime: {
            gte: dayjs().subtract(24, 'hour').toDate() // 只检查24小时内的订单
          }
        }
      });

      for (const payment of pendingPayments) {
        try {
          const status = await qpay.checkPaymentStatus(payment.qpayInvoiceId);
          
          if (status.payment_status === 'PAID') {
            // 更新支付记录状态为已支付
            await this.prisma.payment.update({
              where: { id: payment.id },
              data: {
                paymentStatus: '已支付',
                qpayPaymentId: status.payment_id,
                updatedAt: new Date()
              }
            });

            // 更新订单状态
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
          } else if (status.payment_status === 'CANCELLED' || status.payment_status === 'FAILED') {
            // 更新支付记录状态为支付失败
            await this.prisma.payment.update({
              where: { id: payment.id },
              data: {
                paymentStatus: '支付失败',
                updatedAt: new Date()
              }
            });
          }
        } catch (error) {
          console.error(`检查支付状态失败 (ID: ${payment.id}):`, error);
        }
      }
    } catch (error) {
      console.error('检查待支付记录失败:', error);
    }
  }
}

module.exports = PaymentStatusChecker;