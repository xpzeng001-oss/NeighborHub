const db = require('../models');

async function migrate() {
  try {
    // 检查 coins 列是否已存在
    const [cols] = await db.sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='coins'"
    );
    if (cols.length === 0) {
      await db.sequelize.query('ALTER TABLE users ADD COLUMN coins INT DEFAULT 0');
      console.log('Added coins column');
    } else {
      console.log('coins column already exists');
    }

    // 检查 credit_score 列是否还在
    const [old] = await db.sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='credit_score'"
    );
    if (old.length > 0) {
      await db.sequelize.query('UPDATE users SET coins = GREATEST(credit_score - 100, 0)');
      await db.sequelize.query('ALTER TABLE users DROP COLUMN credit_score');
      console.log('Migrated credit_score to coins');
    }

    // 创建 coin_logs 表
    await db.sequelize.query(
      "CREATE TABLE IF NOT EXISTS coin_logs (" +
      "id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
      "user_id INT UNSIGNED NOT NULL, " +
      "action VARCHAR(32) NOT NULL, " +
      "coins INT NOT NULL, " +
      "ref_id INT UNSIGNED DEFAULT NULL, " +
      "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    );
    console.log('coin_logs table ready');

    console.log('Migration done!');
    process.exit(0);
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  }
}

migrate();
