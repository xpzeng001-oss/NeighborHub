const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'active'  // active | disabled
  }
}, {
  tableName: 'districts'
});

module.exports = District;
