const { createDailyStatistics, getStatistics } = require('../controllers/statistics');

async function statisticsRoutes(fastify, options) {
  // 创建每日统计数据
  fastify.post('/statistics/daily', {
    schema: {
      description: '创建每日统计数据',
      tags: ['统计分析'],
      response: {
        200: {
          type: 'object',
          description: '统计数据',
          properties: {
            id: { type: 'number', description: '统计记录ID' },
            statDate: { type: 'string', format: 'date-time', description: '统计日期' },
            totalUsers: { type: 'number', description: '总用户数' },
            newUsers: { type: 'number', description: '新增用户数' },
            totalOrders: { type: 'number', description: '总订单数' },
            newOrders: { type: 'number', description: '新增订单数' },
            totalMembers: { type: 'number', description: '总会员数' },
            newMembers: { type: 'number', description: '新增会员数' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        500: {
          type: 'object',
          description: '创建失败',
          properties: {
            error: { type: 'string', description: '错误信息' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: createDailyStatistics
  });

  // 获取统计数据
  fastify.get('/statistics', {
    schema: {
      description: '获取统计数据',
      tags: ['统计分析'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date', description: '开始日期' },
          endDate: { type: 'string', format: 'date', description: '结束日期' }
        }
      },
      response: {
        200: {
          type: 'array',
          description: '统计数据列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '统计记录ID' },
              statDate: { type: 'string', format: 'date-time', description: '统计日期' },
              totalUsers: { type: 'number', description: '总用户数' },
              newUsers: { type: 'number', description: '新增用户数' },
              totalOrders: { type: 'number', description: '总订单数' },
              newOrders: { type: 'number', description: '新增订单数' },
              totalMembers: { type: 'number', description: '总会员数' },
              newMembers: { type: 'number', description: '新增会员数' },
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
    preHandler: [fastify.authenticate],
    handler: getStatistics
  });
}

module.exports = statisticsRoutes;