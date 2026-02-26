require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { sequelize, User, Product, Post, Comment, HelpRequest, Rental, PetPost, Banner } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Tables recreated.');

    // 创建用户
    const users = await User.bulkCreate([
      { openid: 'seed_u001', nick_name: '小王妈妈', avatar_url: '', building: '3栋1单元', credit_score: 100 },
      { openid: 'seed_u002', nick_name: '老张', avatar_url: '', building: '7栋2单元', credit_score: 100 },
      { openid: 'seed_u003', nick_name: '数码小哥', avatar_url: '', building: '12栋', credit_score: 100 },
      { openid: 'seed_u004', nick_name: '爱做饭的李姐', avatar_url: '', building: '5栋3单元', credit_score: 100 },
      { openid: 'seed_u005', nick_name: '健身达人', avatar_url: '', building: '9栋1单元', credit_score: 100 },
      { openid: 'seed_u006', nick_name: '6栋大姐', avatar_url: '', building: '6栋1单元', credit_score: 100 },
      { openid: 'seed_u007', nick_name: '遛狗小分队', avatar_url: '', building: '8栋', credit_score: 100 },
      { openid: 'seed_u008', nick_name: '新搬来的小陈', avatar_url: '', building: '2栋', credit_score: 100 },
      { openid: 'seed_u009', nick_name: '10栋小赵', avatar_url: '', building: '10栋2单元', credit_score: 100 },
      { openid: 'seed_u010', nick_name: '物业管理处', avatar_url: '', building: '', credit_score: 100 },
      { openid: 'seed_u011', nick_name: '房东刘先生', avatar_url: '', building: '8栋', credit_score: 100 },
      { openid: 'seed_u012', nick_name: '合租小伙伴', avatar_url: '', building: '2栋', credit_score: 100 }
    ]);

    // 商品
    await Product.bulkCreate([
      { user_id: users[0].id, title: '九成新婴儿推车，宝宝大了用不上', price: 200, original_price: 899, is_free: false, category: '母婴', condition: '九成新', images: ['https://picsum.photos/seed/stroller/400/400'], description: '好孩子品牌婴儿推车，买了不到半年，宝宝大了坐不下了。功能完好，可折叠，送雨棚。楼下面交。', view_count: 56, want_count: 3, trade_method: '楼下交接' },
      { user_id: users[1].id, title: '搬家处理！实木书架 1.8米高', price: 150, original_price: 800, is_free: false, category: '家具', condition: '八成新', images: ['https://picsum.photos/seed/bookshelf/400/400'], description: '马上搬家了，实木书架处理，1.8m高x0.8m宽，五层。自己来拆搬，价格可小刀。', view_count: 128, want_count: 8, trade_method: '上门自提' },
      { user_id: users[2].id, title: 'iPad Air 5 64G Wi-Fi 星光色', price: 2800, original_price: 4799, is_free: false, category: '数码', condition: '九五新', images: ['https://picsum.photos/seed/ipad/400/400'], description: '去年双11买的，贴了膜带了壳，基本没怎么用。配件齐全，带原装充电器。', view_count: 234, want_count: 12, trade_method: '楼下交接' },
      { user_id: users[3].id, title: '【免费】多余的花盆和营养土', price: 0, original_price: 0, is_free: true, category: '家居', condition: '九成新', images: ['https://picsum.photos/seed/flowerpot/400/400'], description: '阳台收拾出来的花盆，大中小各两个，还有半袋营养土。喜欢养花的邻居来拿吧！', view_count: 89, want_count: 15, trade_method: '上门自提' },
      { user_id: users[4].id, title: '哑铃套装 可调节 2-20kg', price: 180, original_price: 399, is_free: false, category: '运动', condition: '九成新', images: ['https://picsum.photos/seed/dumbbell/400/400'], description: '可调节重量哑铃一对，2kg到20kg随意调节。去健身房了用不上，便宜出。', view_count: 67, want_count: 5, trade_method: '楼下交接' },
      { user_id: users[0].id, title: '【免费】儿童绘本30+本', price: 0, original_price: 0, is_free: true, category: '母婴', condition: '八成新', images: ['https://picsum.photos/seed/kidbooks/400/400'], description: '宝宝看过的绘本，有小猪佩奇、汪汪队、各种认知书。适合1-4岁。免费送，自取。', view_count: 145, want_count: 22, trade_method: '上门自提' }
    ]);

    // 论坛帖子
    const posts = await Post.bulkCreate([
      { user_id: users[9].id, category: '公告', title: '关于小区电梯年度维保通知', content: '各位业主好，本周六（1月18日）将进行全小区电梯年度维保，届时1-5栋电梯将分批暂停使用2小时。请大家提前做好出行安排，不便之处敬请谅解。', images: [], like_count: 45, comment_count: 2, is_top: true },
      { user_id: users[5].id, category: '吐槽', title: '楼上深夜装修太吵了！', content: '已经连续三天了，晚上10点还在打电钻！大家帮忙评评理，这合理吗？物业能不能管管？', images: [], like_count: 89, comment_count: 1 },
      { user_id: users[6].id, category: '活动', title: '周末萌宠聚会谁来？', content: '这周日下午3点，小区中心花园老地方。带上你家毛孩子，一起遛遛晒太阳！上次来了12只狗子超开心～', images: [], like_count: 67, comment_count: 1 },
      { user_id: users[7].id, category: '求助', title: '请问小区附近有靠谱的开锁师傅吗？', content: '刚搬来不久，想换个锁芯，有没有邻居推荐靠谱的师傅？价格大概多少？谢谢啦！', images: [], like_count: 12, comment_count: 0 }
    ]);

    // 评论
    await Comment.bulkCreate([
      { post_id: posts[0].id, user_id: users[3].id, content: '收到，谢谢通知！' },
      { post_id: posts[0].id, user_id: users[1].id, content: '请问具体是几点到几点？' },
      { post_id: posts[1].id, user_id: users[9].id, content: '物业已收到反馈，会尽快处理。' },
      { post_id: posts[2].id, user_id: users[4].id, content: '带我家金毛来！' }
    ]);

    // 帮忙请求
    await HelpRequest.bulkCreate([
      { user_id: users[8].id, building: '10栋2单元', title: '求借电钻，装个窗帘', description: '新买了窗帘需要打几个孔，借用一下电钻，半小时就还！', is_urgent: false, deadline: '2025-01-20' },
      { user_id: users[3].id, building: '5栋3单元', title: '【急】有没有人顺路去机场？', description: '明天早上7点要去浦东机场，一个人带着行李打车不方便，可以拼车吗？油费AA。', is_urgent: true, deadline: '2025-01-17' },
      { user_id: users[5].id, building: '6栋1单元', title: '求推荐靠谱的钟点工阿姨', description: '家里需要每周打扫两次，有没有邻居可以推荐靠谱的保洁阿姨？最好是在我们小区做过的。', is_urgent: false }
    ]);

    // 房屋租赁
    await Rental.bulkCreate([
      { user_id: users[10].id, building: '8栋', title: '精装两房朝南 拎包入住', room_type: '2室1厅1卫', area: 78, rent: 5500, deposit: '押一付三', is_agent: false, images: ['https://picsum.photos/seed/apartment1/400/400'], description: '精装修两房，家电齐全，拎包入住。朝南采光好，近地铁站。' },
      { user_id: users[11].id, building: '2栋', title: '主卧出租 限女生', room_type: '主卧（三房合租）', area: 18, rent: 2200, deposit: '押一付一', is_agent: false, images: ['https://picsum.photos/seed/room1/400/400'], description: '三房户型，目前住了两个女生（都是上班族），现主卧出租。有独卫，WiFi家电齐全。' }
    ]);

    // 宠物帖子
    await PetPost.bulkCreate([
      { user_id: users[0].id, type: 'need', pet_name: '团子', pet_type: '英短蓝猫', title: '春节出游，求靠谱猫咪寄养', description: '1月25日-2月2日出去旅游，家里英短蓝猫需要人照顾，猫粮猫砂全提供。', date_range: '1月25日-2月2日', reward: '200元/天', tags: ['猫咪', '寄养', '春节'], status: 'open', response_count: 3 },
      { user_id: users[4].id, type: 'offer', pet_name: '', pet_type: '', title: '专业宠物上门喂养，小区邻居优惠', description: '有3年养宠经验，可提供上门喂食、换水、铲屎、陪玩服务。', date_range: '', reward: '50元/次起', tags: ['上门喂养', '猫狗都可'], status: 'open', response_count: 8 },
      { user_id: users[6].id, type: 'social', pet_name: '', pet_type: '', title: '周末狗狗聚会 - 中心花园', description: '每周六下午3点，小区中心花园，欢迎带狗狗来玩耍交朋友！', date_range: '每周六下午3点', reward: '', tags: ['遛狗', '社交', '周末活动'], status: 'open', response_count: 15 }
    ]);

    // 轮播图
    await Banner.bulkCreate([
      { image: 'https://picsum.photos/seed/banner1/750/300', title: '社区团购上线啦', link: '', sort: 1 },
      { image: 'https://picsum.photos/seed/banner2/750/300', title: '物业通知：春节安排', link: '', sort: 2 },
      { image: 'https://picsum.photos/seed/banner3/750/300', title: '新邻居优惠券', link: '', sort: 3 }
    ]);

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
