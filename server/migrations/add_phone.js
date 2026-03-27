const db = require('../config/database');

async function migrate() {
  try {
    await db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(32) DEFAULT ''");
    console.log('done: phone column added');
  } catch (e) {
    console.log(e.message);
  }
  process.exit(0);
}

migrate();
