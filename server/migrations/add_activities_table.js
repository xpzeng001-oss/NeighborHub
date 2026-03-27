// Migration: Create activities table (MySQL + SQLite compatible)
// Run: node server/migrations/add_activities_table.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sequelize = require('../config/database');

async function migrate() {
  await sequelize.authenticate();
  console.log('Connected to:', sequelize.getDialect());

  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title VARCHAR(128) NOT NULL,
        description TEXT,
        cover_image VARCHAR(512) DEFAULT '',
        images TEXT DEFAULT '[]',
        start_time VARCHAR(64) DEFAULT '',
        end_time VARCHAR(64) DEFAULT '',
        location VARCHAR(128) DEFAULT '',
        latitude FLOAT DEFAULT 0,
        longitude FLOAT DEFAULT 0,
        price FLOAT DEFAULT 0,
        max_participants INTEGER DEFAULT 0,
        current_participants INTEGER DEFAULT 0,
        participant_avatars TEXT DEFAULT '[]',
        status VARCHAR(16) DEFAULT 'open',
        community_id VARCHAR(16) DEFAULT '',
        is_top TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created activities table');
  } catch (e) {
    if (e.message && e.message.includes('already exists')) {
      console.log('⏭️  activities table already exists');
    } else {
      console.error('❌ Error:', e.message);
    }
  }

  console.log('Done.');
  process.exit(0);
}

migrate();
