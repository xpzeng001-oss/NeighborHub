const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoinLog = sequelize.define('CoinLog', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: 'publish_product | publish_post | daily_login | trade_complete | invite'
  },
  coins: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ref_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
    comment: '关联的内容ID（商品/帖子等）'
  }
}, {
  tableName: 'coin_logs',
  updatedAt: false
});

module.exports = CoinLog;
