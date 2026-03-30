const db = require('../config/database');

const tables = ['products', 'activities', 'pet_posts', 'sam_orders', 'carpools'];

async function migrate() {
  for (const table of tables) {
    try {
      await db.query(`ALTER TABLE ${table} ADD COLUMN contact_phone VARCHAR(32) DEFAULT ''`);
      console.log(`done: ${table}.contact_phone added`);
    } catch (e) {
      console.log(`${table}.contact_phone: ${e.message}`);
    }
    try {
      await db.query(`ALTER TABLE ${table} ADD COLUMN contact_wechat VARCHAR(64) DEFAULT ''`);
      console.log(`done: ${table}.contact_wechat added`);
    } catch (e) {
      console.log(`${table}.contact_wechat: ${e.message}`);
    }
  }
  process.exit(0);
}

migrate();
