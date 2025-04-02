const storeSchema = {
  type: 'object',
  required: ['name', 'location'],
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