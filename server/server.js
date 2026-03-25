require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 同步表结构（自动创建新表 + 同步新字段）
    try {
      await sequelize.sync({ alter: true });
      console.log('Database tables synced.');
    } catch (syncErr) {
      console.error('sync({ alter: true }) failed, falling back to sync():', syncErr.message);
      await sequelize.sync();
      console.log('Database tables synced (fallback).');
    }

    // 一次性迁移：credit_score → coins
    try {
      const [results] = await sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='credit_score'"
      );
      if (results.length > 0) {
        await sequelize.query("UPDATE users SET coins = credit_score - 100 WHERE coins = 0 AND credit_score > 100");
        await sequelize.query("ALTER TABLE users DROP COLUMN credit_score");
        console.log('Migrated credit_score → coins.');
      }
    } catch (e) {
      console.error('credit_score migration skipped:', e.message);
    }

    // 确保管理员账号
    try {
      const { User } = require('./models');
      await User.update({ role: 'admin' }, { where: { id: 20 } });
      console.log('Admin user ensured.');
    } catch (e) {
      console.error('Set admin failed:', e.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
