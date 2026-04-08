const db = require('../config/database');
db.query('ALTER TABLE users ADD COLUMN community_id INT UNSIGNED DEFAULT NULL')
  .then(function() { console.log('OK'); process.exit(0); })
  .catch(function(e) { console.error(e.message); process.exit(1); });
