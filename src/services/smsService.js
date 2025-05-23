const axios = require('axios');

class SmsService {
  constructor() {
    this.apiUrl = process.env.SMS_API_URL || '';
    this.token = process.env.SMS_API_TOKEN || '';
    this.from = process.env.SMS_FROM_NUMBER || '';
    this.verificationCodes = new Map(); // 存储验证码
    this.lastSendTime = new Map(); // 记录最后发送时间
    this.minInterval = 60 * 1000; // 最小发送间隔（60秒）
  }

  // 检查是否可以发送验证码
  canSendVerificationCode(phoneNumber) {
    const lastTime = this.lastSendTime.get(phoneNumber);
    if (!lastTime) return true;
    
    const now = Date.now();
    return now - lastTime >= this.minInterval;
  }

  // 生成6位数字验证码
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 发送验证码
  async sendVerificationCode(phoneNumber) {
    try {
      // 检查发送频率
      if (!this.canSendVerificationCode(phoneNumber)) {
        throw new Error('发送太频繁，请稍后再试');
      }

      const code = this.generateVerificationCode();
      const response = await axios.post(this.apiUrl, {
        sms_to: phoneNumber,
        sms_from: this.from,
        sms: `您的验证码是：${code}，5分钟内有效。`
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.status === 200) {
        // 存储验证码，设置5分钟过期
        this.verificationCodes.set(phoneNumber, {
          code,
          expiresAt: Date.now() + 5 * 60 * 1000
        });
        // 记录发送时间
        this.lastSendTime.set(phoneNumber, Date.now());
        return true;
      }
      return false;
    } catch (error) {
      console.error('发送验证码失败:', error);
      throw error;
    }
  }

  // 验证验证码
  verifyCode(phoneNumber, code) {
    const storedData = this.verificationCodes.get(phoneNumber);
    if (!storedData) {
      return false;
    }

    if (Date.now() > storedData.expiresAt) {
      this.verificationCodes.delete(phoneNumber);
      return false;
    }

    if (storedData.code === code) {
      this.verificationCodes.delete(phoneNumber);
      return true;
    }

    return false;
  }
}

module.exports = new SmsService(); 