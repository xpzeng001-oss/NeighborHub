const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PetPost = sequelize.define('PetPost', {
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
    allowNull: false
  },
  pet_name: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  pet_type: {
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
  date_range: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  reward: {
    type: DataTypes.STRING(32),
    defaultValue: ''
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'open'
  },
  response_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  community_id: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  }
}, {
  tableName: 'pet_posts'
});

module.exports = PetPost;
