const db = require('../config/database');

async function migrate() {
  try {
    await db.query("ALTER TABLE users ADD COLUMN wechat_id VARCHAR(64) DEFAULT ''");
    console.log('done: wechat_id column added');
  } catch (e) {
    console.log(e.message);
  }
  process.exit(0);
}

migrate();
