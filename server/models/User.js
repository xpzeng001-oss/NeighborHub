const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  openid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  session_key: {
    type: DataTypes.STRING(128),
    defaultValue: null
  },
  nick_name: {
    type: DataTypes.STRING(64),
    defaultValue: '微信用户'
  },
  avatar_url: {
    type: DataTypes.STRING(512),
    defaultValue: ''
  },
  building: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.STRING(16),
    defaultValue: 'user',
    comment: 'user / admin'
  },
  phone: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  wechat_id: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  community_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: null,
    comment: '用户所属小区ID'
  },
  invited_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
    comment: '邀请人用户ID'
  }
}, {
  tableName: 'users'
});

module.exports = User;
