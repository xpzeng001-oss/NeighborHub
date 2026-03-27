// Migration: Create activities table (MySQL + SQLite compatible)
// Run: node server/migrations/add_activities_table.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sequelize = require('../config/database');
const Activity = require('../models/Activity');

async function migrate() {
  await sequelize.authenticate();
  console.log('Connected to:', sequelize.getDialect());

  try {
    await Activity.sync();
    console.log('✅ activities table ready');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  console.log('Done.');
  process.exit(0);
}

migrate();
