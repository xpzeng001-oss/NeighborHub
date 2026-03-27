const { User } = require('../models');
const wechatService = require('../services/wechatService');
const tokenService = require('../services/tokenService');
const coinService = require('../services/coinService');

const DEFAULT_NICKNAMES = [
  '顺其自然', '今天喝咖啡', '晚风很好', '福气常在', '住在附近的人',
  '笑口常开', '刚从地铁回来', '人生如茶', '心情灿烂', '骑行轻度爱好者',
  '开心每一天', '正在想周末去哪', '花开富贵', '晚饭吃什么', '猫咪观察员',
  '平平淡淡', '乐呵呵', '下楼拿快递', '吉祥如意', '天天都顺心',
  '晚风收集者', '今天想躺平', '福到家门', '周末清理冰箱', '平安是福',
  '万事顺意', '脆脆鲨选手', '心宽福自来', '偶尔做做饭', '天天好运来',
  '安然自得', '今天吃点好的', '花开见喜', '福气满满', '外卖已送到',
  '正在发呆', '富贵吉祥', '笑看人生', '阳台吹吹风', '今天不减肥',
  '家和万事兴', '知足常乐', '清淡是真', '天天好运气', '清风徐来',
  '正在遛狗狗', '天天好消息', '岁月静好', '认真挑水果', '今天也想出门',
  '快乐生活', '平安喜乐', '天天好状态', '常去公园散步', '常温美式派',
  '下楼散步中', '狗狗路过', '满满都是福', '早八困难户', '出门带上耳机',
  '今天想出门', '今天也营业', '番茄炒蛋派', '万事皆如意', '天天好心情',
  '乐在其中', '天天好收获', '余生安好', '幸福安康', '淡然一笑',
  '天天好福气', '心安即是福', '骑车去兜风', '周末不早起', '宁静致远',
  '楼下散步中', '平淡是真', '一切安好', '天天好兆头', '天天好日子',
  '楼下空气不错'
];

// 从 COS 头像库随机选一张
const AVATAR_COUNT = parseInt(process.env.AVATAR_COUNT, 10) || 100;
const AVATAR_BASE = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/neighborhub/avatars`;
function generateDefaultAvatar() {
  const index = Math.floor(Math.random() * AVATAR_COUNT) + 1;
  return `${AVATAR_BASE}/${index}.png`;
}

exports.getAvatarConfig = (req, res) => {
  res.json({
    code: 0,
    data: { baseUrl: AVATAR_BASE, count: AVATAR_COUNT }
  });
};

exports.login = async (req, res, next) => {
  try {
    const { code, phoneCode, nickName, avatarUrl, inviterId } = req.body;

    if (!code) {
      return res.status(400).json({ code: 400, message: '缺少code参数', data: null });
    }

    // 用 code 换取 openid
    const { openid, sessionKey } = await wechatService.code2Session(code);

    // 如果有 phoneCode，获取手机号
    let phoneNumber = '';
    if (phoneCode) {
      try {
        phoneNumber = await wechatService.getPhoneNumber(phoneCode);
      } catch (e) {
        console.error('获取手机号失败', e.message);
      }
    }

    // 随机默认昵称和头像
    const randomNick = DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)];
    const randomAvatar = generateDefaultAvatar();

    // 查找或创建用户
    const defaults = {
      nick_name: nickName || randomNick,
      avatar_url: avatarUrl || randomAvatar,
      phone: phoneNumber || '',
      session_key: sessionKey
    };
    if (inviterId) defaults.invited_by = inviterId;

    let [user, created] = await User.findOrCreate({
      where: { openid },
      defaults
    });

    // 已有用户则更新资料
    if (!created) {
      const updates = { session_key: sessionKey };
      if (nickName) updates.nick_name = nickName;
      if (avatarUrl) updates.avatar_url = avatarUrl;
      if (phoneNumber) updates.phone = phoneNumber;
      // 旧头像是 DiceBear 链接或空的，替换为 COS 头像库
      if (!avatarUrl && (!user.avatar_url || user.avatar_url.includes('dicebear.com'))) {
        updates.avatar_url = generateDefaultAvatar();
      }
      await user.update(updates);
    }

    // 新用户邀请奖励：给邀请人发币
    if (created && inviterId && inviterId !== user.id) {
      await coinService.grant(inviterId, 'invite', user.id);
    }

    // 每日登录奖励
    const loginCoins = await coinService.grant(user.id, 'daily_login');
    if (loginCoins) await user.reload();

    // 签发 JWT
    const token = tokenService.sign({ id: user.id, openid: user.openid });

    res.json({
      code: 0,
      message: 'success',
      data: {
        token,
        userInfo: {
          id: user.id,
          nickName: user.nick_name,
          avatarUrl: user.avatar_url,
          building: user.building,
          coins: user.coins,
          isVerified: user.is_verified,
          role: user.role
        },
        avatarConfig: {
          baseUrl: AVATAR_BASE,
          count: AVATAR_COUNT
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
