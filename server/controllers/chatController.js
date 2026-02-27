const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

// GET /conversations - 会话列表
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user_a_id: userId }, { user_b_id: userId }]
      },
      include: [
        { model: User, as: 'UserA', attributes: ['id', 'nick_name', 'avatar_url'] },
        { model: User, as: 'UserB', attributes: ['id', 'nick_name', 'avatar_url'] }
      ],
      order: [['last_message_at', 'DESC']]
    });

    const list = await Promise.all(conversations.map(async (c) => {
      const other = c.user_a_id === userId ? c.UserB : c.UserA;
      const lastMsg = await Message.findOne({
        where: { conversation_id: c.id },
        order: [['id', 'DESC']]
      });
      const unread = await Message.count({
        where: { conversation_id: c.id, sender_id: { [Op.ne]: userId }, is_read: false }
      });
      return {
        id: c.id,
        targetUser: {
          id: other.id,
          nickName: other.nick_name,
          avatarUrl: other.avatar_url
        },
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageAt: c.last_message_at,
        unreadCount: unread
      };
    }));

    res.json({ code: 0, message: 'success', data: list });
  } catch (err) { next(err); }
};

// POST /conversations - 创建或获取会话
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === userId) {
      return res.json({ code: 400, message: '无效的目标用户', data: null });
    }

    const target = await User.findByPk(targetUserId);
    if (!target) {
      return res.json({ code: 404, message: '用户不存在', data: null });
    }

    // 保证 user_a_id < user_b_id 避免重复
    const userAId = Math.min(userId, targetUserId);
    const userBId = Math.max(userId, targetUserId);

    const [conversation] = await Conversation.findOrCreate({
      where: { user_a_id: userAId, user_b_id: userBId },
      defaults: { user_a_id: userAId, user_b_id: userBId }
    });

    res.json({
      code: 0, message: 'success',
      data: {
        id: conversation.id,
        targetUser: {
          id: target.id,
          nickName: target.nick_name,
          avatarUrl: target.avatar_url
        }
      }
    });
  } catch (err) { next(err); }
};

// GET /conversations/:id/messages - 获取消息列表
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { afterId, page = 1, pageSize = 30 } = req.query;

    // 验证用户属于此会话
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.user_a_id !== userId && conversation.user_b_id !== userId)) {
      return res.json({ code: 403, message: '无权访问此会话', data: null });
    }

    const where = { conversation_id: conversationId };
    if (afterId) {
      where.id = { [Op.gt]: Number(afterId) };
    }

    const { rows, count } = await Message.findAndCountAll({
      where,
      include: [{ model: User, as: 'Sender', attributes: ['id', 'nick_name', 'avatar_url'] }],
      order: afterId ? [['id', 'ASC']] : [['id', 'DESC']],
      limit: Number(pageSize),
      offset: afterId ? 0 : (Number(page) - 1) * Number(pageSize)
    });

    const list = (afterId ? rows : rows.reverse()).map(m => ({
      id: m.id,
      senderId: m.sender_id,
      senderName: m.Sender.nick_name,
      senderAvatar: m.Sender.avatar_url,
      content: m.content,
      isRead: m.is_read,
      createdAt: m.created_at
    }));

    res.json({ code: 0, message: 'success', data: { list, total: count } });
  } catch (err) { next(err); }
};

// POST /conversations/:id/messages - 发送消息
exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.json({ code: 400, message: '消息内容不能为空', data: null });
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.user_a_id !== userId && conversation.user_b_id !== userId)) {
      return res.json({ code: 403, message: '无权访问此会话', data: null });
    }

    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim()
    });

    await conversation.update({ last_message_at: new Date() });

    res.json({
      code: 0, message: 'success',
      data: { id: message.id, createdAt: message.created_at }
    });
  } catch (err) { next(err); }
};

// PUT /conversations/:id/read - 标记已读
exports.markRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;

    await Message.update(
      { is_read: true },
      { where: { conversation_id: conversationId, sender_id: { [Op.ne]: userId }, is_read: false } }
    );

    res.json({ code: 0, message: 'success', data: null });
  } catch (err) { next(err); }
};

// GET /unread - 总未读数
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 找到用户所有会话
    const conversations = await Conversation.findAll({
      where: { [Op.or]: [{ user_a_id: userId }, { user_b_id: userId }] },
      attributes: ['id']
    });
    const convIds = conversations.map(c => c.id);

    let count = 0;
    if (convIds.length > 0) {
      count = await Message.count({
        where: {
          conversation_id: { [Op.in]: convIds },
          sender_id: { [Op.ne]: userId },
          is_read: false
        }
      });
    }

    res.json({ code: 0, message: 'success', data: { count } });
  } catch (err) { next(err); }
};
