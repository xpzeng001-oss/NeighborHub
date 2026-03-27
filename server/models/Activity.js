const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  cover_image: {
    type: DataTypes.STRING(512),
    defaultValue: ''
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  start_time: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  end_time: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  location: {
    type: DataTypes.STRING(128),
    defaultValue: ''
  },
  latitude: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  longitude: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  max_participants: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  current_participants: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  participant_avatars: {
    type: DataTypes.JSON,
    defaultValue: []
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
  tableName: 'activities'
});

module.exports = Activity;
