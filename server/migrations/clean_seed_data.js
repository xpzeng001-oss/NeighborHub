require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Op } = require('sequelize');
const {
  sequelize, User, Product, Post, Comment, HelpRequest,
  Rental, PetPost, Favorite, Report, Violation,
  SamOrder, Carpool, Conversation, Message, CoinLog
} = require('../models');

async function clean() {
  try {
    await sequelize.authenticate();

    // Find all seed users
    const seedUsers = await User.findAll({
      where: { openid: { [Op.like]: 'seed_%' } },
      attributes: ['id'],
      raw: true
    });
    const ids = seedUsers.map(u => u.id);

    if (ids.length === 0) {
      console.log('No seed data found.');
      process.exit(0);
      return;
    }

    console.log(`Found ${ids.length} seed users: ${ids.join(', ')}`);
    const where = { user_id: { [Op.in]: ids } };

    // Delete associated content
    const tables = [
      { model: Product, name: 'products' },
      { model: Post, name: 'posts' },
      { model: Comment, name: 'comments' },
      { model: HelpRequest, name: 'help_requests' },
      { model: PetPost, name: 'pet_posts' },
      { model: SamOrder, name: 'sam_orders' },
      { model: Rental, name: 'rentals' },
      { model: Favorite, name: 'favorites' },
      { model: Report, name: 'reports' },
    ];

    // Optional tables (may not exist)
    try { await Carpool.destroy({ where }); console.log('  cleaned carpools'); } catch (e) {}
    try { await Violation.destroy({ where }); console.log('  cleaned violations'); } catch (e) {}
    try { await CoinLog.destroy({ where }); console.log('  cleaned coin_logs'); } catch (e) {}
    try { await Message.destroy({ where: { sender_id: { [Op.in]: ids } } }); console.log('  cleaned messages'); } catch (e) {}
    try {
      await Conversation.destroy({
        where: { [Op.or]: [{ user1_id: { [Op.in]: ids } }, { user2_id: { [Op.in]: ids } }] }
      });
      console.log('  cleaned conversations');
    } catch (e) {}

    for (const t of tables) {
      try {
        const count = await t.model.destroy({ where });
        console.log(`  cleaned ${t.name}: ${count} rows`);
      } catch (e) {
        console.log(`  skip ${t.name}: ${e.message}`);
      }
    }

    // Delete seed users
    const userCount = await User.destroy({ where: { id: { [Op.in]: ids } } });
    console.log(`  cleaned users: ${userCount} rows`);

    console.log('Done! All seed data removed.');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

clean();
