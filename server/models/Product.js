const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  condition: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'selling'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT
  },
  view_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  want_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  trade_method: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  community_id: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  }
}, {
  tableName: 'products'
});

module.exports = Product;
