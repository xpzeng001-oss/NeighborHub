const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  conversation_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'messages',
  updatedAt: false
});

module.exports = Message;
