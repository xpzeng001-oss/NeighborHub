// Migration: Add is_top column to all content tables (MySQL + SQLite compatible)
// Run: node server/migrations/add_is_top.js

const sequelize = require('../config/database');

const tables = ['products', 'posts', 'help_requests', 'rentals', 'pet_posts', 'sam_orders', 'carpools'];

async function migrate() {
  for (const table of tables) {
    try {
      // Check if column exists first
      const [cols] = await sequelize.query(`SHOW COLUMNS FROM ${table} LIKE 'is_top'`).catch(() => [[]]);
      if (cols && cols.length > 0) {
        console.log(`⏭️  ${table} already has is_top`);
        continue;
      }
    } catch (e) {
      // SHOW COLUMNS might fail on SQLite, try anyway
    }

    try {
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN is_top TINYINT(1) NOT NULL DEFAULT 0`);
      console.log(`✅ Added is_top to ${table}`);
    } catch (e) {
      if (e.message && (e.message.includes('Duplicate') || e.message.includes('duplicate') || e.message.includes('already exists'))) {
        console.log(`⏭️  ${table} already has is_top`);
      } else {
        console.error(`❌ ${table}: ${e.message}`);
      }
    }
  }
  console.log('Done.');
  process.exit(0);
}

migrate();
