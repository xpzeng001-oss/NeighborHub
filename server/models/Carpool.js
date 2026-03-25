const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Carpool = sequelize.define('Carpool', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(16),
    allowNull: false,
    defaultValue: 'offer'
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  from_location: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  to_location: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  date: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  time: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  },
  seats: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  taken_seats: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  fee: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'open'
  },
  community_id: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  },
  is_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'carpools'
});

module.exports = Carpool;
