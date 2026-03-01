require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const {
  sequelize, User, Product, Post, Comment, HelpRequest,
  Rental, PetPost, Banner, Favorite, Conversation, Message,
  Report, Feedback, SamOrder
} = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Tables recreated.');

    // ==================== 用户 ====================
    const users = await User.bulkCreate([
      { openid: 'seed_u001', nick_name: '小王妈妈', avatar_url: '', building: '3栋1单元', credit_score: 180, is_verified: true },
      { openid: 'seed_u002', nick_name: '老张', avatar_url: '', building: '7栋2单元', credit_score: 220, is_verified: true },
      { openid: 'seed_u003', nick_name: '数码小哥', avatar_url: '', building: '12栋', credit_score: 150, is_verified: true },
      { openid: 'seed_u004', nick_name: '爱做饭的李姐', avatar_url: '', building: '5栋3单元', credit_score: 195, is_verified: true },
      { openid: 'seed_u005', nick_name: '健身达人阿凯', avatar_url: '', building: '9栋1单元', credit_score: 160, is_verified: true },
      { openid: 'seed_u006', nick_name: '6栋王大姐', avatar_url: '', building: '6栋1单元', credit_score: 210, is_verified: true },
      { openid: 'seed_u007', nick_name: '遛狗小分队队长', avatar_url: '', building: '8栋', credit_score: 175, is_verified: true },
      { openid: 'seed_u008', nick_name: '新搬来的小陈', avatar_url: '', building: '2栋', credit_score: 100, is_verified: true },
      { openid: 'seed_u009', nick_name: '10栋小赵', avatar_url: '', building: '10栋2单元', credit_score: 135, is_verified: true },
      { openid: 'seed_u010', nick_name: '物业管理处', avatar_url: '', building: '', credit_score: 300, is_verified: true },
      { openid: 'seed_u011', nick_name: '房东刘先生', avatar_url: '', building: '8栋', credit_score: 140, is_verified: true },
      { openid: 'seed_u012', nick_name: '合租小伙伴小美', avatar_url: '', building: '2栋', credit_score: 110, is_verified: true },
      { openid: 'seed_u013', nick_name: '退休周叔', avatar_url: '', building: '1栋', credit_score: 250, is_verified: true },
      { openid: 'seed_u014', nick_name: '程序员小林', avatar_url: '', building: '12栋3单元', credit_score: 120, is_verified: true },
      { openid: 'seed_u015', nick_name: '瑜伽姐姐', avatar_url: '', building: '5栋1单元', credit_score: 165, is_verified: true }
    ]);

    console.log(`Created ${users.length} users.`);

    // ==================== 商品（闲置交易） ====================
    await Product.bulkCreate([
      // 母婴
      { user_id: users[0].id, title: '九成新婴儿推车，宝宝大了用不上', price: 200, original_price: 899, is_free: false, category: '母婴', condition: '九成新', images: ['https://picsum.photos/seed/stroller/400/400'], description: '好孩子品牌婴儿推车，买了不到半年，宝宝大了坐不下了。功能完好，可折叠，送雨棚。楼下面交。', view_count: 56, want_count: 3, trade_method: '楼下交接' },
      { user_id: users[0].id, title: '【免费】儿童绘本30+本', price: 0, original_price: 0, is_free: true, category: '母婴', condition: '八成新', images: ['https://picsum.photos/seed/kidbooks/400/400'], description: '宝宝看过的绘本，有小猪佩奇、汪汪队、各种认知书。适合1-4岁。免费送，自取。', view_count: 145, want_count: 22, trade_method: '上门自提' },
      { user_id: users[11].id, title: '费雪婴儿健身架，带音乐', price: 60, original_price: 299, is_free: false, category: '母婴', condition: '八成新', images: ['https://picsum.photos/seed/babygym/400/400'], description: '费雪脚踏钢琴健身架，功能正常，电池新换的。适合0-12个月宝宝。', view_count: 33, want_count: 4, trade_method: '楼下交接' },

      // 家具
      { user_id: users[1].id, title: '搬家处理！实木书架 1.8米高', price: 150, original_price: 800, is_free: false, category: '家具', condition: '八成新', images: ['https://picsum.photos/seed/bookshelf/400/400'], description: '马上搬家了，实木书架处理，1.8m高x0.8m宽，五层。自己来拆搬，价格可小刀。', view_count: 128, want_count: 8, trade_method: '上门自提' },
      { user_id: users[5].id, title: '宜家KALLAX置物架 白色', price: 80, original_price: 399, is_free: false, category: '家具', condition: '九成新', images: ['https://picsum.photos/seed/kallax/400/400'], description: '4格置物架，用了半年，搬家带不走。需自提，附赠两个收纳盒。', view_count: 76, want_count: 6, trade_method: '上门自提' },
      { user_id: users[12].id, title: '【免费】旧沙发，能坐就行', price: 0, original_price: 0, is_free: true, category: '家具', condition: '五成新', images: ['https://picsum.photos/seed/sofa/400/400'], description: '三人位布艺沙发，有点旧了但还能用。换新沙发了，放门口了谁要谁搬走。', view_count: 210, want_count: 5, trade_method: '上门自提' },

      // 数码
      { user_id: users[2].id, title: 'iPad Air 5 64G Wi-Fi 星光色', price: 2800, original_price: 4799, is_free: false, category: '数码', condition: '九五新', images: ['https://picsum.photos/seed/ipad/400/400'], description: '去年双11买的，贴了膜带了壳，基本没怎么用。配件齐全，带原装充电器。', view_count: 234, want_count: 12, trade_method: '楼下交接' },
      { user_id: users[13].id, title: 'AirPods Pro 2 自用', price: 800, original_price: 1899, is_free: false, category: '数码', condition: '九成新', images: ['https://picsum.photos/seed/airpods/400/400'], description: '买了新的索尼降噪耳机，这个出掉。降噪效果依然很好，电池健康度92%。', view_count: 189, want_count: 15, trade_method: '楼下交接' },
      { user_id: users[2].id, title: '机械键盘 Cherry红轴', price: 220, original_price: 599, is_free: false, category: '数码', condition: '九成新', images: ['https://picsum.photos/seed/keyboard/400/400'], description: 'Cherry MX Board 3.0 红轴，手感很好，换了客制化键盘所以出。', view_count: 98, want_count: 7, trade_method: '楼下交接' },

      // 家居
      { user_id: users[3].id, title: '【免费】多余的花盆和营养土', price: 0, original_price: 0, is_free: true, category: '家居', condition: '九成新', images: ['https://picsum.photos/seed/flowerpot/400/400'], description: '阳台收拾出来的花盆，大中小各两个，还有半袋营养土。喜欢养花的邻居来拿吧！', view_count: 89, want_count: 15, trade_method: '上门自提' },
      { user_id: users[14].id, title: '香薰蜡烛套装 全新未拆', price: 45, original_price: 168, is_free: false, category: '家居', condition: '全新', images: ['https://picsum.photos/seed/candle/400/400'], description: '朋友送的生日礼物，家里已经有了。三只装礼盒，薰衣草/柑橘/檀木香型。', view_count: 52, want_count: 8, trade_method: '楼下交接' },

      // 运动
      { user_id: users[4].id, title: '哑铃套装 可调节 2-20kg', price: 180, original_price: 399, is_free: false, category: '运动', condition: '九成新', images: ['https://picsum.photos/seed/dumbbell/400/400'], description: '可调节重量哑铃一对，2kg到20kg随意调节。去健身房了用不上，便宜出。', view_count: 67, want_count: 5, trade_method: '楼下交接' },
      { user_id: users[4].id, title: '瑜伽垫+拉力带套装', price: 30, original_price: 129, is_free: false, category: '运动', condition: '八成新', images: ['https://picsum.photos/seed/yogamat/400/400'], description: '6mm厚瑜伽垫，带三根不同磅数的弹力带。用了几个月，清洗干净了。', view_count: 41, want_count: 3, trade_method: '楼下交接' },
      { user_id: users[7].id, title: '【免费】滑板 新手入门款', price: 0, original_price: 0, is_free: true, category: '运动', condition: '七成新', images: ['https://picsum.photos/seed/skateboard/400/400'], description: '学了两个月放弃了...轮子有磨损但还能滑。放小区门口自取。', view_count: 88, want_count: 11, trade_method: '上门自提' },

      // 已售商品
      { user_id: users[1].id, title: '全套厨具 不粘锅+炒锅+蒸锅', price: 120, original_price: 450, is_free: false, category: '家居', condition: '八成新', images: ['https://picsum.photos/seed/cookware/400/400'], description: '三件套锅具，苏泊尔的。搬家处理。', view_count: 156, want_count: 9, trade_method: '上门自提', status: 'sold' },
      { user_id: users[3].id, title: 'Switch 健身环大冒险', price: 150, original_price: 499, is_free: false, category: '数码', condition: '九成新', images: ['https://picsum.photos/seed/ringfit/400/400'], description: '坚持了一个月没坚持下去...游戏和环都有。', view_count: 203, want_count: 18, trade_method: '楼下交接', status: 'sold' }
    ]);

    console.log('Created products.');

    // ==================== 论坛帖子 ====================
    const posts = await Post.bulkCreate([
      // 公告
      { user_id: users[9].id, category: '公告', title: '关于小区电梯年度维保通知', content: '各位业主好，本周六（3月1日）将进行全小区电梯年度维保，届时1-5栋电梯将分批暂停使用2小时。请大家提前做好出行安排，不便之处敬请谅解。\n\n具体时间安排：\n1-2栋：8:00-10:00\n3-5栋：10:00-12:00\n6-8栋：13:00-15:00\n9-12栋：15:00-17:00', images: [], like_count: 45, comment_count: 3, is_top: true },
      { user_id: users[9].id, category: '公告', title: '小区快递柜新增2组，位置在7栋旁', content: '应大家要求，物业在7栋旁新增了2组丰巢快递柜，已投入使用。希望能缓解双11、618快递爆仓的问题。', images: [], like_count: 78, comment_count: 2, is_top: true },

      // 吐槽
      { user_id: users[5].id, category: '吐槽', title: '楼上深夜装修太吵了！', content: '已经连续三天了，晚上10点还在打电钻！大家帮忙评评理，这合理吗？物业能不能管管？我家小孩都被吵醒好几次了。', images: [], like_count: 89, comment_count: 4 },
      { user_id: users[8].id, category: '吐槽', title: '谁家的外卖又放在我家门口了', content: '已经第三次了！3单元的外卖放到了2单元来。外卖小哥能不能看清楚单元号再放？？？', images: [], like_count: 34, comment_count: 3 },
      { user_id: users[13].id, category: '吐槽', title: '地下车库灯又坏了', content: 'B2层靠东边那排灯已经坏了快一个月了，每次停车都是摸黑。@物业 什么时候修啊？', images: [], like_count: 56, comment_count: 2 },

      // 求助
      { user_id: users[7].id, category: '求助', title: '请问小区附近有靠谱的开锁师傅吗？', content: '刚搬来不久，想换个锁芯，有没有邻居推荐靠谱的师傅？价格大概多少？谢谢啦！', images: [], like_count: 12, comment_count: 3 },
      { user_id: users[11].id, category: '求助', title: '家里WiFi信号特别差怎么办？', content: '2栋的墙特别厚，路由器放客厅卧室就没信号了。有没有邻居遇到同样问题的？怎么解决的？', images: [], like_count: 23, comment_count: 4 },
      { user_id: users[12].id, category: '求助', title: '有没有拼车上班的？方向国贸', content: '每天早上8点出发去国贸，一个人开车太浪费了。有没有顺路的邻居想拼车？油费AA~', images: [], like_count: 18, comment_count: 2 },

      // 活动
      { user_id: users[6].id, category: '活动', title: '周末萌宠聚会谁来？', content: '这周日下午3点，小区中心花园老地方。带上你家毛孩子，一起遛遛晒太阳！上次来了12只狗子超开心～', images: [], like_count: 67, comment_count: 3 },
      { user_id: users[14].id, category: '活动', title: '瑜伽爱好者集合！免费带练', content: '我是瑜伽教练，周末想在小区花园带大家做晨练瑜伽。时间：每周六早上7:30，自备瑜伽垫。完全免费，就当锻炼身体交朋友啦！', images: [], like_count: 93, comment_count: 5 },
      { user_id: users[3].id, category: '活动', title: '邻里厨艺交流会，分享你的拿手菜', content: '想组织一次邻居间的厨艺交流，每人做一道拿手菜大家一起品尝。初步定在这周六下午，有兴趣的留言报名！', images: [], like_count: 112, comment_count: 6 }
    ]);

    console.log('Created posts.');

    // ==================== 评论 ====================
    await Comment.bulkCreate([
      // 电梯维保帖评论
      { post_id: posts[0].id, user_id: users[3].id, content: '收到，谢谢通知！' },
      { post_id: posts[0].id, user_id: users[1].id, content: '请问具体是几点到几点？老人腿脚不好需要提前安排。' },
      { post_id: posts[0].id, user_id: users[9].id, content: '已在帖子中补充了具体时间安排，请查看。' },

      // 快递柜帖评论
      { post_id: posts[1].id, user_id: users[7].id, content: '太好了！之前总是放不下。' },
      { post_id: posts[1].id, user_id: users[2].id, content: '建议再在12栋那边也加几组。' },

      // 深夜装修帖评论
      { post_id: posts[2].id, user_id: users[9].id, content: '物业已收到反馈，会尽快上门沟通。按规定装修时间为工作日8:00-18:00。' },
      { post_id: posts[2].id, user_id: users[1].id, content: '支持维权！晚上10点装修太过分了。' },
      { post_id: posts[2].id, user_id: users[12].id, content: '我也听到了，确实很吵。' },
      { post_id: posts[2].id, user_id: users[7].id, content: '可以直接打物业电话投诉，或者报警也行。' },

      // 外卖放错帖评论
      { post_id: posts[3].id, user_id: users[5].id, content: '哈哈哈我也遇到过！' },
      { post_id: posts[3].id, user_id: users[1].id, content: '建议备注里写清楚单元号，字大一点。' },
      { post_id: posts[3].id, user_id: users[13].id, content: '可以在门口贴个纸条写上"X单元XXX"，外卖小哥就不会搞错了。' },

      // 车库灯帖评论
      { post_id: posts[4].id, user_id: users[9].id, content: '已安排维修，预计本周内修好。' },
      { post_id: posts[4].id, user_id: users[1].id, content: '终于有人说了，我也等好久了。' },

      // 开锁师傅帖评论
      { post_id: posts[5].id, user_id: users[5].id, content: '推荐一个姓马的师傅，电话138xxxx5678，上次我家换锁芯收了150，很靠谱。' },
      { post_id: posts[5].id, user_id: users[1].id, content: '小区门口五金店老板也能换，价格便宜。' },
      { post_id: posts[5].id, user_id: users[12].id, content: '我刚搬来的时候也换了，建议换C级锁芯，安全。' },

      // WiFi信号帖评论
      { post_id: posts[6].id, user_id: users[13].id, content: '程序员来答！买个Mesh路由器就解决了，推荐小米的，两只装300多。' },
      { post_id: posts[6].id, user_id: users[2].id, content: '华硕的也不错，我家用的灵耀AX，穿墙效果很好。' },
      { post_id: posts[6].id, user_id: users[8].id, content: '我之前也是这个问题，后来买了电力猫解决了。' },
      { post_id: posts[6].id, user_id: users[14].id, content: '同2栋同感！最后买了个AP面板直接嵌墙里了。' },

      // 拼车帖评论
      { post_id: posts[7].id, user_id: users[13].id, content: '我也在国贸上班！不过我一般8:30出发，可以约一下。' },
      { post_id: posts[7].id, user_id: users[14].id, content: '方向不一样但祝你找到拼车伙伴~' },

      // 萌宠聚会帖评论
      { post_id: posts[8].id, user_id: users[4].id, content: '带我家金毛来！它超爱交朋友。' },
      { post_id: posts[8].id, user_id: users[0].id, content: '可以带猫吗哈哈哈。' },
      { post_id: posts[8].id, user_id: users[12].id, content: '上次好好玩！这次一定来。' },

      // 瑜伽帖评论
      { post_id: posts[9].id, user_id: users[3].id, content: '报名！一直想练瑜伽没动力。' },
      { post_id: posts[9].id, user_id: users[0].id, content: '产后恢复可以练吗？' },
      { post_id: posts[9].id, user_id: users[14].id, content: '当然可以！我会安排适合不同水平的动作。' },
      { post_id: posts[9].id, user_id: users[11].id, content: '报名+1，需要自备其他装备吗？' },
      { post_id: posts[9].id, user_id: users[5].id, content: '支持！以前在健身房上过瑜伽课，很喜欢。' },

      // 厨艺交流帖评论
      { post_id: posts[10].id, user_id: users[5].id, content: '我来！拿手菜是红烧肉。' },
      { post_id: posts[10].id, user_id: users[1].id, content: '我可以做一道老家的手撕鸡。' },
      { post_id: posts[10].id, user_id: users[7].id, content: '我只会煮泡面，可以来蹭吃吗哈哈。' },
      { post_id: posts[10].id, user_id: users[12].id, content: '烘焙算吗？我可以做个蛋糕。' },
      { post_id: posts[10].id, user_id: users[14].id, content: '好棒的活动！我做一道沙拉。' },
      { post_id: posts[10].id, user_id: users[4].id, content: '在哪里办？需要提前准备什么吗？' }
    ]);

    console.log('Created comments.');

    // ==================== 帮忙请求 ====================
    await HelpRequest.bulkCreate([
      { user_id: users[8].id, building: '10栋2单元', title: '求借电钻，装个窗帘', description: '新买了窗帘需要打几个孔，借用一下电钻，半小时就还！', is_urgent: false, deadline: '2026-03-05' },
      { user_id: users[3].id, building: '5栋3单元', title: '【急】有没有人顺路去机场？', description: '明天早上7点要去浦东机场，一个人带着行李打车不方便，可以拼车吗？油费AA。', is_urgent: true, deadline: '2026-02-28' },
      { user_id: users[5].id, building: '6栋1单元', title: '求推荐靠谱的钟点工阿姨', description: '家里需要每周打扫两次，有没有邻居可以推荐靠谱的保洁阿姨？最好是在我们小区做过的。', is_urgent: false },
      { user_id: users[0].id, building: '3栋1单元', title: '有没有邻居会修水龙头？', description: '厨房水龙头漏水，请了师傅报价200多，感觉太贵了。有没有会修的邻居帮忙看看？请吃饭！', is_urgent: false, deadline: '2026-03-10' },
      { user_id: users[7].id, building: '2栋', title: '搬家求帮忙抬个沙发下楼', description: '周六下午搬家，有个三人沙发需要从5楼搬下来（没电梯），求两位壮汉帮忙！请喝奶茶！', is_urgent: false, deadline: '2026-03-01' },
      { user_id: users[13].id, building: '12栋3单元', title: '【急】家里停电了，谁有手电筒？', description: '突然跳闸了，配电箱在楼道里但太黑看不见。有没有邻居能借个手电筒或者来帮忙看看？', is_urgent: true },
      { user_id: users[11].id, building: '8栋', title: '求帮忙收个快递', description: '今天有个大件快递到但我出差不在家，有没有8栋的邻居帮忙签收一下？回来请你喝咖啡！', is_urgent: false, deadline: '2026-02-27' },
      { user_id: users[14].id, building: '5栋1单元', title: '找人拼团买水果', description: '找到一家果园直发的车厘子，5斤装128元，但要3箱起送。有没有邻居想一起拼？', is_urgent: false, deadline: '2026-03-03' }
    ]);

    console.log('Created help requests.');

    // ==================== 房屋租赁 ====================
    await Rental.bulkCreate([
      { user_id: users[10].id, building: '8栋', title: '精装两房朝南 拎包入住', room_type: '2室1厅1卫', area: 78, rent: 5500, deposit: '押一付三', is_agent: false, images: ['https://picsum.photos/seed/apartment1/400/400'], description: '精装修两房，家电齐全（冰箱洗衣机空调热水器），拎包入住。朝南采光好，楼下就是公交站，近地铁3号线。' },
      { user_id: users[11].id, building: '2栋', title: '主卧出租 限女生', room_type: '主卧（三房合租）', area: 18, rent: 2200, deposit: '押一付一', is_agent: false, images: ['https://picsum.photos/seed/room1/400/400'], description: '三房户型，目前住了两个女生（都是上班族），现主卧出租。有独卫，WiFi家电齐全。养了一只猫，介意勿扰。' },
      { user_id: users[1].id, building: '7栋', title: '一室一厅 适合情侣/单人', room_type: '1室1厅1卫', area: 45, rent: 3800, deposit: '押一付三', is_agent: false, images: ['https://picsum.photos/seed/apartment2/400/400'], description: '简装一室一厅，干净整洁。家具家电齐全，楼层好视野开阔。小区环境好，适合喜欢安静的朋友。' },
      { user_id: users[12].id, building: '2栋', title: '次卧出租 男女不限', room_type: '次卧（两房合租）', area: 12, rent: 1800, deposit: '押一付一', is_agent: false, images: ['https://picsum.photos/seed/room2/400/400'], description: '两房户型，另一间住的是程序员小哥。次卧虽小但朝南有阳光。共用卫生间和厨房，人都比较随和。' },
      { user_id: users[10].id, building: '9栋', title: '豪装三房 全家电 看房随时', room_type: '3室2厅2卫', area: 120, rent: 8500, deposit: '押二付三', is_agent: false, images: ['https://picsum.photos/seed/apartment3/400/400'], description: '精装三房，品牌家电全配。小区中心位置，楼下花园。适合家庭入住。看房随时联系。' }
    ]);

    console.log('Created rentals.');

    // ==================== 宠物帖子 ====================
    await PetPost.bulkCreate([
      { user_id: users[0].id, type: 'need', pet_name: '团子', pet_type: '英短蓝猫', title: '春节出游，求靠谱猫咪寄养', description: '3月出去旅游一周，家里英短蓝猫"团子"需要人照顾。很乖不闹，猫粮猫砂罐头全提供，只需要每天喂食换水铲屎就行。', date_range: '3月8日-3月15日', reward: '200元/天', tags: ['猫咪', '寄养', '春节'], status: 'open', response_count: 3 },
      { user_id: users[4].id, type: 'offer', pet_name: '', pet_type: '', title: '专业宠物上门喂养，小区邻居优惠', description: '有3年养宠经验，可提供上门喂食、换水、铲屎、陪玩服务。猫狗仓鼠都可以，会拍照片视频发给主人。可提供养宠资格证书。', date_range: '随时可约', reward: '50元/次起', tags: ['上门喂养', '猫狗都可', '专业'], status: 'open', response_count: 8 },
      { user_id: users[6].id, type: 'social', pet_name: '', pet_type: '', title: '周末狗狗聚会 - 中心花园', description: '每周六下午3点，小区中心花园，欢迎带狗狗来玩耍交朋友！大小狗都欢迎，注意牵好绳子。上次来了12只汪超热闹～', date_range: '每周六下午3点', reward: '', tags: ['遛狗', '社交', '周末活动'], status: 'open', response_count: 15 },
      { user_id: users[8].id, type: 'need', pet_name: '可乐', pet_type: '柯基', title: '出差一周，求帮遛狗', description: '下周要出差，家里柯基"可乐"需要人帮忙每天早晚各遛一次，每次半小时左右。它很温顺，不会乱跑。', date_range: '3月3日-3月9日', reward: '150元/天', tags: ['狗狗', '遛狗', '柯基'], status: 'open', response_count: 2 },
      { user_id: users[14].id, type: 'social', pet_name: '', pet_type: '', title: '猫咪领养日！有缘来带走', description: '救助的流浪猫生了一窝小猫，现在两个月大了，很健康活泼。做了驱虫和基础检查。希望找到有爱心的家庭领养。', date_range: '随时可看猫', reward: '', tags: ['领养', '猫咪', '公益'], status: 'open', response_count: 12 },
      { user_id: users[7].id, type: 'offer', pet_name: '', pet_type: '', title: '可以帮忙遛狗！限小区内', description: '我家也有狗，每天早晚都会遛。如果你家狗子和我家能玩到一起，可以一起遛。', date_range: '每天早7点/晚8点', reward: '免费', tags: ['遛狗', '免费', '互助'], status: 'open', response_count: 5 }
    ]);

    console.log('Created pet posts.');

    // ==================== 收藏 ====================
    await Favorite.bulkCreate([
      { user_id: users[7].id, product_id: 1 },
      { user_id: users[7].id, product_id: 7 },
      { user_id: users[3].id, product_id: 7 },
      { user_id: users[5].id, product_id: 3 },
      { user_id: users[13].id, product_id: 9 },
      { user_id: users[14].id, product_id: 10 },
      { user_id: users[8].id, product_id: 12 },
      { user_id: users[0].id, product_id: 8 },
      { user_id: users[12].id, product_id: 2 },
      { user_id: users[11].id, product_id: 14 }
    ]);

    console.log('Created favorites.');

    // ==================== 私信会话 & 消息 ====================
    const convs = await Conversation.bulkCreate([
      { user_a_id: users[7].id, user_b_id: users[0].id },
      { user_a_id: users[3].id, user_b_id: users[2].id },
      { user_a_id: users[8].id, user_b_id: users[4].id },
      { user_a_id: users[13].id, user_b_id: users[2].id }
    ]);

    await Message.bulkCreate([
      // 对话1: 小陈想买婴儿推车
      { conversation_id: convs[0].id, sender_id: users[7].id, content: '你好，婴儿推车还在吗？' },
      { conversation_id: convs[0].id, sender_id: users[0].id, content: '在的，你想什么时候来看？' },
      { conversation_id: convs[0].id, sender_id: users[7].id, content: '今晚下班后可以吗？大概7点' },
      { conversation_id: convs[0].id, sender_id: users[0].id, content: '可以的，到了给我打电话，我在3栋1单元' },

      // 对话2: 李姐想买iPad
      { conversation_id: convs[1].id, sender_id: users[3].id, content: 'iPad还在吗？能便宜点吗？' },
      { conversation_id: convs[1].id, sender_id: users[2].id, content: '在的，最低2600，已经很便宜了' },
      { conversation_id: convs[1].id, sender_id: users[3].id, content: '行，2600可以，什么时候方便交易？' },

      // 对话3: 小赵问健身达人哑铃
      { conversation_id: convs[2].id, sender_id: users[8].id, content: '哑铃还在吗？能包邮寄吗？' },
      { conversation_id: convs[2].id, sender_id: users[4].id, content: '哈哈不寄的，太重了。我们同小区楼下面交就行' },
      { conversation_id: convs[2].id, sender_id: users[8].id, content: '好的 那周末约个时间吧' },

      // 对话4: 程序员小林问数码小哥键盘
      { conversation_id: convs[3].id, sender_id: users[13].id, content: '键盘是什么轴体？有钢板吗？' },
      { conversation_id: convs[3].id, sender_id: users[2].id, content: 'Cherry红轴，有钢板，手感很顺滑' },
      { conversation_id: convs[3].id, sender_id: users[13].id, content: '200行吗？程序员用键盘费得快哈哈' },
      { conversation_id: convs[3].id, sender_id: users[2].id, content: '行，200拿走，今晚可以交' }
    ]);

    console.log('Created conversations & messages.');

    // ==================== 举报 ====================
    await Report.bulkCreate([
      { user_id: users[5].id, target_type: 'product', target_id: 7, reason: '疑似假货', description: '这个价格的iPad不太正常，怀疑是翻新机冒充准新机。', status: 'pending' },
      { user_id: users[8].id, target_type: 'post', target_id: 3, reason: '内容不友善', description: '吐槽帖评论区有人身攻击。', status: 'resolved' },
      { user_id: users[1].id, target_type: 'user', target_id: users[11].id, reason: '疑似中介', description: '这个房东发了很多房源，怀疑是中介假扮个人房东。', status: 'pending' }
    ]);

    console.log('Created reports.');

    // ==================== 意见反馈 ====================
    await Feedback.bulkCreate([
      { user_id: users[7].id, type: '功能建议', content: '希望可以加个二手物品的搜索功能，现在东西多了不好找。', contact: '' },
      { user_id: users[13].id, type: 'Bug反馈', content: '发帖之后返回列表没有自动刷新，需要手动下拉才能看到新帖。', contact: 'wx: coderlin2024' },
      { user_id: users[3].id, type: '功能建议', content: '建议加个"已完成"状态，帮忙请求完成后可以标记。', contact: '' },
      { user_id: users[14].id, type: '其他', content: '小程序做得很好用！希望能一直运营下去，我们小区终于有自己的平台了。', contact: '' },
      { user_id: users[5].id, type: 'Bug反馈', content: '上传图片偶尔会失败，尤其是拍照的时候。', contact: '138xxxx6789' }
    ]);

    console.log('Created feedbacks.');

    // ==================== 山姆拼单 ====================
    await SamOrder.bulkCreate([
      { user_id: users[0].id, title: '本周六山姆拼单，满¥299包邮', description: '准备这周六去山姆采购，有需要的邻居可以一起拼单，主要买日用品和零食。', deadline: '本周五 18:00', pickup_method: '送货上门（3栋大堂）', min_amount: 50, target_count: 8, current_count: 5, status: 'open' },
      { user_id: users[4].id, title: '山姆牛排拼团，A5和牛特价', description: '山姆APP上A5和牛在做活动，原价¥398/kg，活动价¥268/kg。有需要的邻居跟团，满5人下单。', deadline: '明天 12:00', pickup_method: '自提（6栋门口）', min_amount: 100, target_count: 5, current_count: 5, status: 'full' },
      { user_id: users[2].id, title: '周日山姆日用品拼单', description: '周日计划去山姆，纸巾、洗衣液、零食等日用品都可以拼，帮跑腿费每单¥5。', deadline: '周六 20:00', pickup_method: '送货上门', min_amount: 30, target_count: 10, current_count: 3, status: 'open' }
    ]);

    console.log('Created sam orders.');

    // ==================== 轮播图 ====================
    await Banner.bulkCreate([
      { image: 'https://picsum.photos/seed/banner1/750/300', title: '社区团购上线啦', link: '', sort: 1 },
      { image: 'https://picsum.photos/seed/banner2/750/300', title: '物业通知：春季绿化', link: '', sort: 2 },
      { image: 'https://picsum.photos/seed/banner3/750/300', title: '新邻居欢迎计划', link: '', sort: 3 }
    ]);

    console.log('Created banners.');
    console.log('\n✅ All seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();