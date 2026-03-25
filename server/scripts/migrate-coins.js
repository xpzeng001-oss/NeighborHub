const db = require('../models');

async function migrate() {
  try {
    // 检查 users 表结构
    const [columns] = await db.sequelize.query("PRAGMA table_info(users)");
    const colNames = columns.map(c => c.name);
    const hasCoins = colNames.includes('coins');
    const hasCreditScore = colNames.includes('credit_score');

    // 添加 coins 列
    if (!hasCoins) {
      await db.sequelize.query('ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0');
      console.log('Added coins column');
    } else {
      console.log('coins column already exists');
    }

    // 迁移 credit_score 数据
    if (hasCreditScore) {
      await db.sequelize.query('UPDATE users SET coins = MAX(credit_score - 100, 0)');
      console.log('Migrated credit_score data to coins');
      // SQLite 不支持 DROP COLUMN（旧版本），保留旧列不影响使用
      console.log('Note: credit_score column kept (SQLite limitation), will be ignored');
    }

    // 创建 coin_logs 表
    await db.sequelize.query(
      "CREATE TABLE IF NOT EXISTS coin_logs (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "user_id INTEGER NOT NULL, " +
      "action VARCHAR(32) NOT NULL, " +
      "coins INTEGER NOT NULL, " +
      "ref_id INTEGER DEFAULT NULL, " +
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
