// Migration: Add participant_ids column to activities table
// Run: node server/migrations/add_participant_ids.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sequelize = require('../config/database');

async function migrate() {
  await sequelize.authenticate();
  console.log('Connected to:', sequelize.getDialect());

  try {
    await sequelize.query("ALTER TABLE activities ADD COLUMN participant_ids JSON DEFAULT '[]'");
    console.log('✅ Added participant_ids column');
  } catch (e) {
    if (e.message && (e.message.includes('Duplicate') || e.message.includes('duplicate') || e.message.includes('already exists'))) {
      console.log('⏭️  participant_ids already exists');
    } else {
      console.error('❌ Error:', e.message);
    }
  }

  console.log('Done.');
  process.exit(0);
}

migrate();
