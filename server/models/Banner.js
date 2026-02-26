const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  image: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(64),
    defaultValue: ''
  },
  link: {
    type: DataTypes.STRING(256),
    defaultValue: ''
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'banners'
});

module.exports = Banner;
