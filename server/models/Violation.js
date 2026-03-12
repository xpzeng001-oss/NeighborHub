const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Violation = sequelize.define('Violation', {
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
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: 'content_violation / report_confirmed / manual'
  },
  target_type: {
    type: DataTypes.STRING(20),
    comment: 'product / post / comment / pet / sam / carpool / help'
  },
  target_id: {
    type: DataTypes.INTEGER.UNSIGNED
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  admin_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'violations',
  underscored: true
});

module.exports = Violation;
