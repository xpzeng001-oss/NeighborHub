require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/database');

async function clean() {
  try {
    const ids = '1,2,3,4,5,6,7,8,9,10,11,12';
    await db.query(`DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_a_id IN (${ids}) OR user_b_id IN (${ids}))`);
    console.log('cleaned messages');
    await db.query(`DELETE FROM conversations WHERE user_a_id IN (${ids}) OR user_b_id IN (${ids})`);
    console.log('cleaned conversations');
    await db.query(`DELETE FROM users WHERE id IN (${ids})`);
    console.log('cleaned seed users');
    console.log('Done!');
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
}

clean();
