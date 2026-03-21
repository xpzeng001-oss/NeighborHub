const { User } = require('../models');
const wechatService = require('../services/wechatService');
const tokenService = require('../services/tokenService');

const DEFAULT_NICKNAMES = [
  '快乐邻居', '阳光住户', '友善邻里', '温馨家人', '热心业主',
  '开心果', '小太阳', '好邻居', '暖心人', '微笑达人'
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
    const { code, phoneCode, nickName, avatarUrl } = req.body;

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
    let [user, created] = await User.findOrCreate({
      where: { openid },
      defaults: {
        nick_name: nickName || randomNick,
        avatar_url: avatarUrl || randomAvatar,
        phone: phoneNumber || '',
        session_key: sessionKey
      }
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
          creditScore: user.credit_score,
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
