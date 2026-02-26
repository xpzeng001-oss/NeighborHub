const { User } = require('../models');
const wechatService = require('../services/wechatService');
const tokenService = require('../services/tokenService');

exports.login = async (req, res, next) => {
  try {
    const { code, nickName, avatarUrl } = req.body;

    if (!code) {
      return res.status(400).json({ code: 400, message: '缺少code参数', data: null });
    }

    // 用 code 换取 openid
    const { openid, sessionKey } = await wechatService.code2Session(code);

    // 查找或创建用户
    let [user, created] = await User.findOrCreate({
      where: { openid },
      defaults: {
        nick_name: nickName || '微信用户',
        avatar_url: avatarUrl || '',
        session_key: sessionKey
      }
    });

    // 已有用户则更新资料
    if (!created) {
      const updates = { session_key: sessionKey };
      if (nickName) updates.nick_name = nickName;
      if (avatarUrl) updates.avatar_url = avatarUrl;
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
          isVerified: user.is_verified
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
