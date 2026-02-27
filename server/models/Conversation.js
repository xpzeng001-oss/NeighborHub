const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_a_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  user_b_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  last_message_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conversations',
  indexes: [
    { unique: true, fields: ['user_a_id', 'user_b_id'] }
  ]
});

module.exports = Conversation;
