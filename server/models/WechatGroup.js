const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WechatGroup = sequelize.define('WechatGroup', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(256),
    defaultValue: ''
  },
  qrcode_url: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  created_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  district_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'wechat_groups'
});

module.exports = WechatGroup;
