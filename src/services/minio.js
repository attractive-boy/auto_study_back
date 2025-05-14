const Minio = require('minio');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

class MinioService {
  constructor() {
    logger.info('MinIO 初始化开始');
    
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '19000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });
    
    this.bucket = process.env.MINIO_DEFAULT_BUCKET || 'auto-study';
    this.init();
  }

  async init() {
    try {
      logger.info(`正在检查 bucket 是否存在: ${this.bucket}`);
      
      const exists = await this.client.bucketExists(this.bucket);
      logger.info(`Bucket ${this.bucket} exists: ${exists}`);
      
      if (!exists) {
        // 创建存储桶
        await this.client.makeBucket(this.bucket, '');
        logger.info(`Bucket ${this.bucket} created`);
      }
    } catch (error) {
      logger.error('MinIO 初始化失败', {
        error: {
          message: error.message,
          stack: error.stack
        }
      });
      throw error;
    }
  }

  async uploadFile(file, folder = '') {
    try {
      const fileName = `${folder}/${uuidv4()}-${file.filename}`.replace(/^\/+/, '');
      logger.info('开始上传文件', { fileName, mimetype: file.mimetype });

      const buffer = await file.toBuffer();
      await this.client.putObject(this.bucket, fileName, buffer, buffer.length, {
        'Content-Type': file.mimetype
      });

      logger.info('文件上传完成', { fileName });
      return fileName;
    } catch (error) {
      logger.error('文件上传失败', {
        error: {
          message: error.message,
          stack: error.stack
        },
        file: {
          name: file.filename,
          folder
        }
      });
      throw error;
    }
  }

  async getFileUrl(fileName, expiry = 24 * 60 * 60) {
    try {
      return await this.client.presignedGetObject(this.bucket, fileName, expiry);
    } catch (error) {
      logger.error('获取文件URL失败', {
        error: {
          message: error.message,
          stack: error.stack
        },
        fileName
      });
      throw error;
    }
  }

  async deleteFile(fileName) {
    try {
      await this.client.removeObject(this.bucket, fileName);
      logger.info('文件删除成功', { fileName });
    } catch (error) {
      logger.error('删除文件失败', {
        error: {
          message: error.message,
          stack: error.stack
        },
        fileName
      });
      throw error;
    }
  }
}

module.exports = new MinioService(); 