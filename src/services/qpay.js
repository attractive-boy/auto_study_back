const axios = require('axios');
const dayjs = require('dayjs');

class QPay {
  constructor() {
    this.baseURL = process.env.QPAY_API_URL || 'https://api.qpay.mn/v2';
    this.clientId = process.env.QPAY_CLIENT_ID;
    this.clientSecret = process.env.QPAY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpireTime = null;
  }

  async getAccessToken() {
    if (this.accessToken && dayjs().isBefore(this.tokenExpireTime)) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/token`, {
        username: this.clientId,
        password: this.clientSecret
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpireTime = dayjs().add(response.data.expires_in, 'second');
      return this.accessToken;
    } catch (error) {
      throw new Error('获取QPay访问令牌失败: ' + error.message);
    }
  }

  async refreshToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpireTime = dayjs().add(response.data.expires_in, 'second');
      return this.accessToken;
    } catch (error) {
      throw new Error('刷新QPay令牌失败: ' + error.message);
    }
  }

  async createInvoice(payment) {
    const token = await this.getAccessToken();
    try {
      const response = await axios.post(`${this.baseURL}/invoice`, {
        invoice_code: 'TEST_INVOICE',
        sender_invoice_no: payment.id.toString(),
        invoice_receiver_code: 'terminal',
        invoice_description: `订单支付 #${payment.orderId}`,
        amount: payment.amount,
        callback_url: `${process.env.API_BASE_URL}/payments/callback`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        invoiceId: response.data.invoice_id,
        qrText: response.data.qr_text,
        qrImage: response.data.qr_image,
        paymentUrls: response.data.urls
      };
    } catch (error) {
      throw new Error('创建QPay发票失败: ' + error.message);
    }
  }

  async getInvoiceStatus(invoiceId) {
    const token = await this.getAccessToken();
    try {
      const response = await axios.get(`${this.baseURL}/invoice/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error('获取QPay发票状态失败: ' + error.message);
    }
  }

  async cancelInvoice(invoiceId) {
    const token = await this.getAccessToken();
    try {
      await axios.delete(`${this.baseURL}/invoice/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      throw new Error('取消QPay发票失败: ' + error.message);
    }
  }

  async checkPaymentStatus(invoiceId) {
    const token = await this.getAccessToken();
    try {
      const response = await axios.post(`${this.baseURL}/payment/check`, {
        object_type: 'INVOICE',
        object_id: invoiceId,
        offset: {
          page_number: 1,
          page_limit: 1
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error('检查QPay支付状态失败: ' + error.message);
    }
  }

  async refund(paymentId, note = '退款') {
    const token = await this.getAccessToken();
    try {
      await axios.delete(`${this.baseURL}/payment/refund/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      throw new Error('QPay退款失败: ' + error.message);
    }
  }
}

module.exports = new QPay();