const db = require('../models');

async function main() {
  await db.sequelize.sync();

  // 创建南约社区
  const [district] = await db.District.findOrCreate({
    where: { name: '南约社区' },
    defaults: { name: '南约社区', status: 'active' }
  });
  console.log('社区ID:', district.id);

  // 重命名
  await db.Community.update(
    { name: '峦山美地' },
    { where: { name: '仁恒峦山美地' } }
  );

  // 添加小区
  const names = [
    '峦山美地',
    '卓弘高尔夫雅苑',
    '荷谷美苑',
    '中海阳光橡树园',
    '顺泽阳光公馆',
    '京基御景荟都',
    '金地名峰',
    '振业天峦',
    '振业峦山谷'
  ];

  for (const name of names) {
    await db.Community.findOrCreate({
      where: { name },
      defaults: { name, status: 'active', district_id: district.id }
    });
  }

  // 把未分配的小区也归到该社区
  await db.Community.update(
    { district_id: district.id },
    { where: { district_id: null } }
  );

  const list = await db.Community.findAll({
    attributes: ['id', 'name', 'district_id']
  });
  console.log('小区列表:', list.map(c => c.name).join(', '));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
