const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServicePost = sequelize.define('ServicePost', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  type: { type: DataTypes.STRING(32), allowNull: false, comment: 'housekeeping/repair/tutoring/other' },
  title: { type: DataTypes.STRING(128), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  images: { type: DataTypes.JSON, defaultValue: [] },
  status: { type: DataTypes.STRING(16), defaultValue: 'open' },
  community_id: { type: DataTypes.STRING(16), defaultValue: '' },
  is_top: { type: DataTypes.BOOLEAN, defaultValue: false },
  contact_phone: { type: DataTypes.STRING(32), defaultValue: '' },
  contact_wechat: { type: DataTypes.STRING(64), defaultValue: '' }
}, {
  tableName: 'service_posts'
});

module.exports = ServicePost;
