const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SamOrder = sequelize.define('SamOrder', {
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
  description: {
    type: DataTypes.TEXT
  },
  deadline: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  pickup_method: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  min_amount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  target_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 5
  },
  current_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'open'
  },
  community_id: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  }
}, {
  tableName: 'sam_orders'
});

module.exports = SamOrder;
