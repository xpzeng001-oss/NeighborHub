// Migration: Add invited_by column to users table
// Run: node server/migrations/add_invited_by.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sequelize = require('../config/database');

async function migrate() {
  await sequelize.authenticate();
  console.log('Connected to:', sequelize.getDialect());

  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN invited_by INT UNSIGNED DEFAULT NULL');
    console.log('✅ Added invited_by to users');
  } catch (e) {
    if (e.message && (e.message.includes('Duplicate') || e.message.includes('duplicate') || e.message.includes('already exists'))) {
      console.log('⏭️  users already has invited_by');
    } else {
      console.error('❌', e.message);
    }
  }
  console.log('Done.');
  process.exit(0);
}

migrate();
