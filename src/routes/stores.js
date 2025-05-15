const { createStore, updateStore, deleteStore, getStore, getStores, getStoreSeats, getStoreServices } = require('../controllers/stores');

async function storeRoutes(fastify, options) {
  // 创建店铺
  fastify.post('/stores', {
    schema: {
      description: '创建新店铺',
      tags: ['店铺管理'],
      body: {
        type: 'object',
        required: ['name', 'location', 'businessStart', 'businessEnd', 'description', 'notice', 'bookingProcess', 'phone', 'totalSeats'],
        properties: {
          name: { type: 'string', description: '店铺名称' },
          location: { type: 'string', description: '店铺位置' },
          longitude: { type: 'number', description: '店铺经度', default: 0 },
          latitude: { type: 'number', description: '店铺纬度', default: 0 },
          businessStart: { type: 'string', description: '营业开始时间' },
          businessEnd: { type: 'string', description: '营业结束时间' },
          totalSeats: { type: 'integer', description: '总座位数' },
          description: { 
            type: 'string', 
            description: '场地介绍（支持富文本格式，可包含图片、表格、列表等HTML内容）' 
          },
          notice: { 
            type: 'string', 
            description: '注意事项（支持富文本格式，可包含图片、表格、列表等HTML内容）' 
          },
          bookingProcess: { 
            type: 'string', 
            description: '预约流程（支持富文本格式，可包含图片、表格、列表等HTML内容）' 
          },
          phone: { type: 'string', description: '自习室电话' },
          wifiAccount: { type: 'string', description: 'WiFi账号' },
          wifiPassword: { type: 'string', description: 'WiFi密码' },
          images: {
            type: 'array',
            description: '店铺轮播图',
            items: {
              type: 'object',
              required: ['imageName', 'sortOrder'],
              properties: {
                imageName: { type: 'string', description: '图片名称' },
                sortOrder: { type: 'integer', description: '排序顺序' }
              }
            }
          }
        }
      },
      response: {
        201: {
          type: 'object',
          description: '店铺创建成功',
          properties: {
            id: { type: 'number', description: '店铺ID' },
            name: { type: 'string', description: '店铺名称' },
            location: { type: 'string', description: '店铺位置' },
            longitude: { type: 'number', description: '店铺经度' },
            latitude: { type: 'number', description: '店铺纬度' },
            businessStart: { type: 'string', description: '营业开始时间' },
            businessEnd: { type: 'string', description: '营业结束时间' },
            totalSeats: { type: 'integer', description: '座位总数' },
            availableSeats: { type: 'integer', description: '剩余座位数' },
            description: { type: 'string', description: '场地介绍' },
            notice: { type: 'string', description: '注意事项' },
            bookingProcess: { type: 'string', description: '预约流程' },
            phone: { type: 'string', description: '自习室电话' },
            wifiAccount: { type: 'string', description: 'WiFi账号' },
            wifiPassword: { type: 'string', description: 'WiFi密码' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', description: '图片ID' },
                  imageName: { type: 'string', description: '图片名称' },
                  sortOrder: { type: 'integer', description: '排序顺序' },
                  isActive: { type: 'boolean', description: '是否激活' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        400: {
          type: 'object',
          description: '创建失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: createStore
  });

  // 获取店铺列表
  fastify.get('/stores', {
    schema: {
      description: '获取所有店铺列表',
      tags: ['店铺管理'],
      response: {
        200: {
          type: 'array',
          description: '店铺列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '店铺ID' },
              name: { type: 'string', description: '店铺名称' },
              location: { type: 'string', description: '店铺位置' },
              businessStart: { type: 'string', description: '营业开始时间' },
              businessEnd: { type: 'string', description: '营业结束时间' },
              description: { type: 'string', description: '场地介绍' },
              notice: { type: 'string', description: '注意事项' },
              bookingProcess: { type: 'string', description: '预约流程' },
              phone: { type: 'string', description: '自习室电话' },
              wifiAccount: { type: 'string', description: 'WiFi账号' },
              wifiPassword: { type: 'string', description: 'WiFi密码' },
              storeImages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', description: '图片ID' },
                    imageName: { type: 'string', description: '图片名称' },
                    sortOrder: { type: 'integer', description: '排序顺序' },
                    isActive: { type: 'boolean', description: '是否激活' }
                  }
                }
              },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
            }
          }
        }
      }
    },
    handler: getStores
  });

  // 获取单个店铺信息
  fastify.get('/stores/:id', {
    schema: {
      description: '获取单个店铺详细信息',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '店铺ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '店铺信息',
          properties: {
            id: { type: 'number', description: '店铺ID' },
            name: { type: 'string', description: '店铺名称' },
            location: { type: 'string', description: '店铺位置' },
            longitude: { type: 'number', description: '店铺经度' },
            latitude: { type: 'number', description: '店铺纬度' },
            businessStart: { type: 'string', description: '营业开始时间' },
            businessEnd: { type: 'string', description: '营业结束时间' },
            totalSeats: { type: 'integer', description: '座位总数' },
            availableSeats: { type: 'integer', description: '剩余座位数' },
            description: { type: 'string', description: '场地介绍（富文本）' },
            notice: { type: 'string', description: '注意事项（富文本）' },
            bookingProcess: { type: 'string', description: '预约流程（富文本）' },
            wifiAccount: { type: 'string', description: 'WiFi账号' },
            wifiPassword: { type: 'string', description: 'WiFi密码' },
            phone: { type: 'string', description: '自习室电话' },
            storeImages: {
              type: 'array',
              description: '店铺轮播图',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', description: '图片ID' },
                  imageName: { type: 'string', description: '图片名称' },
                  sortOrder: { type: 'integer', description: '排序顺序' },
                  isActive: { type: 'boolean', description: '是否激活' }
                }
              }
            },
            seats: {
              type: 'array',
              description: '店铺座位列表',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', description: '座位ID' },
                  seatNumber: { type: 'string', description: '座位号' },
                  status: { type: 'string', description: '座位状态' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        404: {
          type: 'object',
          description: '店铺不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: getStore
  });

  // 更新店铺信息
  fastify.put('/stores/:id', {
    schema: {
      description: '更新店铺信息',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '店铺ID' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '店铺名称' },
          location: { type: 'string', description: '店铺位置' },
          longitude: { type: 'number', description: '店铺经度' },
          latitude: { type: 'number', description: '店铺纬度' },
          businessStart: { type: 'string', description: '营业开始时间' },
          businessEnd: { type: 'string', description: '营业结束时间' },
          totalSeats: { type: 'integer', description: '总座位数' },
          description: { 
            type: 'string', 
            description: '场地介绍（支持富文本格式，可包含图片、表格、列表等HTML内容）' 
          },
          notice: { 
            type: 'string', 
            description: '注意事项（支持富文本格式，可包含图片、表格、列表等HTML内容）' 
          },
          bookingProcess: { 
            type: 'string', 
            description: '预约流程（支持富文本格式，可包含图片、表格、列表等HTML内容）' 
          },
          phone: { type: 'string', description: '自习室电话' },
          wifiAccount: { type: 'string', description: 'WiFi账号' },
          wifiPassword: { type: 'string', description: 'WiFi密码' },
          images: {
            type: 'array',
            description: '店铺轮播图',
            items: {
              type: 'object',
              required: ['imageName', 'sortOrder'],
              properties: {
                imageName: { type: 'string', description: '图片名称' },
                sortOrder: { type: 'integer', description: '排序顺序' }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '更新成功',
          properties: {
            id: { type: 'number', description: '店铺ID' },
            name: { type: 'string', description: '店铺名称' },
            location: { type: 'string', description: '店铺位置' },
            longitude: { type: 'number', description: '店铺经度' },
            latitude: { type: 'number', description: '店铺纬度' },
            businessStart: { type: 'string', description: '营业开始时间' },
            businessEnd: { type: 'string', description: '营业结束时间' },
            totalSeats: { type: 'integer', description: '座位总数' },
            availableSeats: { type: 'integer', description: '剩余座位数' },
            description: { type: 'string', description: '场地介绍' },
            notice: { type: 'string', description: '注意事项' },
            bookingProcess: { type: 'string', description: '预约流程' },
            phone: { type: 'string', description: '自习室电话' },
            wifiAccount: { type: 'string', description: 'WiFi账号' },
            wifiPassword: { type: 'string', description: 'WiFi密码' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', description: '图片ID' },
                  imageName: { type: 'string', description: '图片名称' },
                  sortOrder: { type: 'integer', description: '排序顺序' },
                  isActive: { type: 'boolean', description: '是否激活' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        400: {
          type: 'object',
          description: '更新失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        },
        404: {
          type: 'object',
          description: '店铺不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: updateStore
  });

  // 删除店铺
  fastify.delete('/stores/:id', {
    schema: {
      description: '删除店铺',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: '店铺ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          description: '删除成功',
          properties: {
            message: { type: 'string', description: '成功信息' }
          }
        },
        404: {
          type: 'object',
          description: '店铺不存在',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: deleteStore
  });

  // 获取店铺的座位列表
  fastify.get('/stores/:storeId/seats', {
    schema: {
      description: '获取店铺的座位列表',
      tags: ['店铺管理'],
      params: {
        type: 'object',
        required: ['storeId'],
        properties: {
          storeId: { type: 'string', description: '店铺ID' }
        }
      },
      response: {
        200: {
          type: 'array',
          description: '座位列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '座位ID' },
              storeId: { type: 'number', description: '店铺ID' },
              seatNumber: { type: 'string', description: '座位号' },
              status: { type: 'string', description: '座位状态' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
            }
          }
        },
        500: {
          type: 'object',
          description: '获取失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    handler: getStoreSeats
  });

}

module.exports = storeRoutes;