require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 同步表结构（自动创建新表 + 同步新字段）
    await sequelize.sync({ alter: true });
    console.log('Database tables synced.');

    // 确保管理员账号
    const { User } = require('./models');
    await User.update({ role: 'admin' }, { where: { id: 20 } });
    console.log('Admin user ensured.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
