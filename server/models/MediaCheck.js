const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaCheck = sequelize.define('MediaCheck', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  trace_id: { type: DataTypes.STRING(128), allowNull: false, unique: true },
  content_type: { type: DataTypes.STRING(32), allowNull: false }, // product, post, help, pet, sam, carpool
  content_id: { type: DataTypes.INTEGER, allowNull: false },
  media_url: { type: DataTypes.STRING(512) },
  status: { type: DataTypes.STRING(16), defaultValue: 'pending' } // pending, pass, risky
}, {
  tableName: 'media_checks',
  underscored: true
});

module.exports = MediaCheck;
