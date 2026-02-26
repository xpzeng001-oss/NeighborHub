const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(16),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  like_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  comment_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  is_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  community_id: {
    type: DataTypes.STRING(16),
    defaultValue: ''
  }
}, {
  tableName: 'posts'
});

module.exports = Post;
