const { Post, Comment, User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, category, communityId } = req.query;
    const where = {};
    if (category) where.category = category;
    if (communityId) where.community_id = communityId;

    const { rows, count } = await Post.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url'] }],
      order: [['is_top', 'DESC'], ['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(p => ({
      id: p.id,
      userId: p.user_id,
      userName: p.User ? p.User.nick_name : '匿名用户',
      userAvatar: p.User ? p.User.avatar_url : '',
      category: p.category,
      title: p.title,
      content: p.content,
      images: p.images || [],
      likeCount: p.like_count,
      commentCount: p.comment_count,
      isTop: p.is_top,
      createdAt: p.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'nick_name', 'avatar_url'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url'] }],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    res.json({
      code: 0,
      data: {
        id: post.id,
        userId: post.user_id,
        userName: post.User ? post.User.nick_name : '匿名用户',
        userAvatar: post.User ? post.User.avatar_url : '',
        category: post.category,
        title: post.title,
        content: post.content,
        images: post.images || [],
        likeCount: post.like_count,
        commentCount: post.comment_count,
        isTop: post.is_top,
        createdAt: post.created_at,
        comments: (post.Comments || []).map(c => ({
          id: c.id,
          userId: c.user_id,
          userName: c.User.nick_name,
          userAvatar: c.User.avatar_url,
          content: c.content,
          createdAt: c.created_at
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { category, title, content, images } = req.body;
    if (!title || !category) {
      return res.status(400).json({ code: 400, message: '标题和分类不能为空', data: null });
    }

    const post = await Post.create({
      user_id: req.user.id,
      category,
      title,
      content: content || '',
      images: images || []
    });

    res.json({ code: 0, data: { id: post.id } });
  } catch (err) {
    next(err);
  }
};

exports.like = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }
    await post.increment('like_count');
    res.json({ code: 0, data: { likeCount: post.like_count + 1 } });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ code: 400, message: '评论内容不能为空', data: null });
    }

    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    const comment = await Comment.create({
      post_id: post.id,
      user_id: req.user.id,
      content
    });

    await post.increment('comment_count');

    const user = await User.findByPk(req.user.id, { attributes: ['nick_name', 'avatar_url'] });

    res.json({
      code: 0,
      data: {
        id: comment.id,
        userId: req.user.id,
        userName: user.nick_name,
        userAvatar: user.avatar_url,
        content: comment.content,
        createdAt: comment.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};
