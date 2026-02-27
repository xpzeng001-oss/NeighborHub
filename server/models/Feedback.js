const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '功能建议 / Bug反馈 / 其他'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  }
}, {
  tableName: 'feedbacks',
  updatedAt: false
});

module.exports = Feedback;