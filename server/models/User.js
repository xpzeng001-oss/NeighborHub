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
  credit_score: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users'
});

module.exports = User;
