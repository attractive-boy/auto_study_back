const minioService = require('../services/minio');
const path = require('path');
const logger = require('../config/logger');

async function routes(fastify, options) {
  // 文件上传接口
  fastify.post('/upload', {
    schema: {
      hide: false,
      description: '文件上传接口',
      tags: ['文件管理'],
      summary: '上传文件到 MinIO',
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { 
            type: 'string', 
            format: 'binary',
            description: '要上传的文件'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            fileName: { 
              type: 'string',
              description: '存储后的文件名'
            },
            url: { 
              type: 'string',
              description: '文件访问URL'
            },
            downloadUrl: {
              type: 'string',
              description: '文件下载URL'
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              description: '错误信息'
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              description: '错误信息'
            }
          }
        }
      }
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => {
      return () => true;  // 禁用请求体验证
    },
    preValidation: async (request, reply) => {
      try {
        const parts = await request.parts();
        let hasFile = false;
        
        for await (const part of parts) {
          if (part.type === 'file') {
            hasFile = true;
            request.file = part;
          }
        }

        if (!hasFile) {
          throw new Error('未找到上传文件');
        }
      } catch (error) {
        reply.code(400).send({ error: error.message });
        return reply;
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        logger.info('开始处理文件上传请求');
        
        const { file } = request;
        const originalFileName = file.filename;
        logger.info('准备上传文件', { filename: originalFileName });

        // 上传文件到 MinIO，使用原始文件名作为存储名
        const fileName = await minioService.uploadFile(file, '');
        logger.info('文件上传成功', { fileName });

        // 获取文件访问URL
        const url = await minioService.getFileUrl(fileName);
        logger.info('获取文件URL成功', { url });

        // 构建下载URL
        const downloadUrl = `/download/${fileName}`;

        return { 
          fileName, 
          url,
          downloadUrl 
        };
      } catch (error) {
        logger.error('文件上传失败', {
          error: {
            message: error.message,
            stack: error.stack
          }
        });
        reply.code(500).send({ error: error.message });
      }
    }
  });

  // 获取文件下载链接
  fastify.get('/download/:fileName', {
    schema: {
      description: '获取文件下载链接',
      tags: ['文件管理'],
      summary: '获取文件的临时下载链接',
      params: {
        type: 'object',
        properties: {
          fileName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            url: { type: 'string' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { fileName } = request.params;
        const url = await minioService.getFileUrl(fileName);
        return { url };
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    }
  });

  // 删除文件
  fastify.delete('/files/:fileName', {
    schema: {
      description: '删除文件',
      tags: ['文件管理'],
      summary: '从 MinIO 中删除指定文件',
      params: {
        type: 'object',
        properties: {
          fileName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { fileName } = request.params;
        await minioService.deleteFile(fileName);
        return { message: '文件删除成功' };
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    }
  });
}

module.exports = routes; 