const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rental = sequelize.define('Rental', {
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
  room_type: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  area: {
    type: DataTypes.DECIMAL(6, 1),
    defaultValue: 0
  },
  rent: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  deposit: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  is_agent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT
  },
  community_id: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  }
}, {
  tableName: 'rentals'
});

module.exports = Rental;
