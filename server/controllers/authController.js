const { User } = require('../models');
const wechatService = require('../services/wechatService');
const tokenService = require('../services/tokenService');

const DEFAULT_NICKNAMES = [
  '快乐邻居', '阳光住户', '友善邻里', '温馨家人', '热心业主',
  '开心果', '小太阳', '好邻居', '暖心人', '微笑达人'
];
// DiceBear 风格头像，用随机 seed 生成唯一头像
const AVATAR_STYLES = ['fun-emoji', 'adventurer', 'avataaars', 'bottts', 'lorelei'];
function generateDefaultAvatar() {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=200`;
}

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
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
