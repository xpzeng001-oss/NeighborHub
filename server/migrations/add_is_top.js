// Migration: Add is_top column to all content tables
// Run: node server/migrations/add_is_top.js

const sequelize = require('../config/database');

const tables = ['products', 'help_requests', 'rentals', 'pet_posts', 'sam_orders', 'carpools'];

async function migrate() {
  for (const table of tables) {
    try {
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN is_top BOOLEAN DEFAULT 0`);
      console.log(`✅ Added is_top to ${table}`);
    } catch (e) {
      if (e.message && e.message.includes('duplicate column')) {
        console.log(`⏭️  ${table} already has is_top`);
      } else {
        console.log(`⏭️  ${table}: ${e.message}`);
      }
    }
  }
  console.log('Done.');
  process.exit(0);
}

migrate();
