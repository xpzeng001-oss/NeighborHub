const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Community = sequelize.define('Community', {
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
  address: {
    type: DataTypes.STRING(256),
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(16),
    defaultValue: 'active'  // active | disabled
  }
}, {
  tableName: 'communities'
});

module.exports = Community;
