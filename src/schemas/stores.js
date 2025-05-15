const storeSchema = {
  type: 'object',
  required: [
    'name',
    'location',
    'businessStart',
    'businessEnd',
    'totalSeats',
    'phone'
  ],
  properties: {
    name: { 
      type: 'string', 
      description: '店铺名称',
      minLength: 1,
      maxLength: 50
    },
    location: { 
      type: 'string', 
      description: '店铺位置',
      minLength: 1,
      maxLength: 200
    },
    longitude: {
      type: 'number',
      description: '店铺经度'
    },
    latitude: {
      type: 'number',
      description: '店铺纬度'
    },
    businessStart: {
      type: 'string',
      description: '营业开始时间',
      pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
    },
    businessEnd: {
      type: 'string',
      description: '营业结束时间',
      pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
    },
    totalSeats: {
      type: 'integer',
      description: '座位总数',
      minimum: 1
    },
    availableSeats: {
      type: 'integer',
      description: '剩余座位数',
      minimum: 0
    },
    description: {
      type: 'string',
      description: '场地介绍',
      minLength: 1
    },
    notice: {
      type: 'string',
      description: '注意事项',
      minLength: 1
    },
    bookingProcess: {
      type: 'string',
      description: '预约流程',
      minLength: 1
    },
    phone: {
      type: 'string',
      description: '自习室电话',
      pattern: '^[0-9-+()]{5,20}$'
    },
    wifiAccount: {
      type: 'string',
      description: 'WiFi账号'
    },
    wifiPassword: {
      type: 'string',
      description: 'WiFi密码'
    }
  }
};

const updateStoreSchema = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      description: '店铺名称',
      minLength: 1,
      maxLength: 50
    },
    location: { 
      type: 'string', 
      description: '店铺位置',
      minLength: 1,
      maxLength: 200
    }
  }
};

module.exports = {
  storeSchema,
  updateStoreSchema
};