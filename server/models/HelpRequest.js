const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HelpRequest = sequelize.define('HelpRequest', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  building: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'open'
  },
  deadline: {
    type: DataTypes.DATEONLY,
    defaultValue: null
  },
  community_id: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  }
}, {
  tableName: 'help_requests'
});

module.exports = HelpRequest;
