const router = require('express').Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');
const { WechatGroup, User } = require('../models');

// GET / — 公开列表
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const where = { status: 'active' };
    if (req.query.districtId) {
      where.district_id = req.query.districtId;
    }
    const list = await WechatGroup.findAll({
      where,
      order: [['sort_order', 'DESC'], ['created_at', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'nick_name', 'avatar_url'] }]
    });
    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
});

// POST / — 管理员创建
router.post('/', auth, adminAuth, async (req, res, next) => {
  try {
    const { name, description, qrcode_url, sort_order, district_id } = req.body;
    if (!name || !qrcode_url) {
      return res.status(400).json({ code: 400, message: '群名称和二维码不能为空' });
    }
    const group = await WechatGroup.create({
      name,
      description: description || '',
      qrcode_url,
      sort_order: sort_order || 0,
      district_id: district_id || null,
      created_by: req.user.id
    });
    res.json({ code: 0, data: group });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — 管理员编辑
router.put('/:id', auth, adminAuth, async (req, res, next) => {
  try {
    const group = await WechatGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ code: 404, message: '群聊不存在' });
    }
    const { name, description, qrcode_url, sort_order, status, district_id } = req.body;
    await group.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(qrcode_url !== undefined && { qrcode_url }),
      ...(sort_order !== undefined && { sort_order }),
      ...(status !== undefined && { status }),
      ...(district_id !== undefined && { district_id })
    });
    res.json({ code: 0, data: group });
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — 管理员删除
router.delete('/:id', auth, adminAuth, async (req, res, next) => {
  try {
    const group = await WechatGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ code: 404, message: '群聊不存在' });
    }
    await group.destroy();
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
