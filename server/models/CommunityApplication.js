const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommunityApplication = sequelize.define('CommunityApplication', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(256),
    defaultValue: ''
  },
  reason: {
    type: DataTypes.STRING(512),
    defaultValue: ''
  },
  contact: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'pending'  // pending | approved | rejected
  },
  admin_note: {
    type: DataTypes.STRING(256),
    defaultValue: ''
  },
  handled_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'community_applications'
});

module.exports = CommunityApplication;
