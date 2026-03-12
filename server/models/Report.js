const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  target_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'product / post / user'
  },
  target_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    comment: 'pending / resolved / rejected'
  },
  admin_note: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  handled_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    comment: 'admin user id'
  }
}, {
  tableName: 'reports',
  updatedAt: true
});

module.exports = Report;
