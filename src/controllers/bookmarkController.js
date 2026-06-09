/**
 * Bookmark Controller - 书签控制器
 */

const { Bookmark, Tag } = require('../models');

/**
 * GET /api/bookmarks - 获取书签列表
 */
async function list(req, res) {
  try {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const bookmarks = await Bookmark.find()
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'email');

    const total = await Bookmark.countDocuments();

    res.json({
      data: bookmarks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List bookmarks error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * GET /api/bookmarks/:id - 获取单个书签
 */
async function getOne(req, res) {
  try {
    const bookmark = await Bookmark.findById(req.params.id).populate('userId', 'email');

    if (!bookmark) {
      return res.status(404).json({ error: '书签不存在' });
    }

    res.json(bookmark);
  } catch (error) {
    console.error('Get bookmark error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * GET /api/bookmarks/search - 搜索书签
 */
async function search(req, res) {
  try {
    const { q, tags, page = 1, limit = 20, sort = 'starCount', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const query = {};

    // 关键词搜索
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { url: { $regex: q, $options: 'i' } },
      ];
    }

    // 标签筛选
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      query.tags = { $all: tagList };
    }

    const sortObj = { [sort]: sortOrder };

    const bookmarks = await Bookmark.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'email');

    const total = await Bookmark.countDocuments(query);

    res.json({
      data: bookmarks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search bookmarks error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * POST /api/bookmarks - 创建书签
 */
async function create(req, res) {
  try {
    const { url, title, description, tags } = req.body;
    const userId = req.userId;

    if (!url || !title) {
      return res.status(400).json({ error: 'URL 和标题不能为空' });
    }

    const bookmark = new Bookmark({
      url,
      title,
      description: description || '',
      tags: tags || [],
      userId,
    });

    await bookmark.save();

    // 同步标签计数
    await syncTags(bookmark.tags);

    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Create bookmark error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * PUT /api/bookmarks/:id - 更新书签
 */
async function update(req, res) {
  try {
    const { url, title, description, tags } = req.body;
    const bookmarkId = req.params.id;
    const userId = req.userId;

    const bookmark = await Bookmark.findById(bookmarkId);

    if (!bookmark) {
      return res.status(404).json({ error: '书签不存在' });
    }

    // 检查是否是创建者
    if (bookmark.userId.toString() !== userId) {
      return res.status(403).json({ error: '只有创建者可以编辑书签' });
    }

    // 更新字段
    if (url) bookmark.url = url;
    if (title) bookmark.title = title;
    if (description !== undefined) bookmark.description = description;
    if (tags !== undefined) bookmark.tags = tags;

    await bookmark.save();

    // 同步标签计数
    await syncTags(bookmark.tags);

    res.json(bookmark);
  } catch (error) {
    console.error('Update bookmark error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * DELETE /api/bookmarks/:id - 删除书签
 */
async function remove(req, res) {
  try {
    const bookmarkId = req.params.id;
    const userId = req.userId;

    const bookmark = await Bookmark.findById(bookmarkId);

    if (!bookmark) {
      return res.status(404).json({ error: '书签不存在' });
    }

    // 检查是否是创建者
    if (bookmark.userId.toString() !== userId) {
      return res.status(403).json({ error: '只有创建者可以删除书签' });
    }

    await Bookmark.findByIdAndDelete(bookmarkId);

    // 同步标签计数
    await syncTags(bookmark.tags);

    res.json({ message: '书签已删除' });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * POST /api/bookmarks/:id/star - 收藏书签
 */
async function star(req, res) {
  try {
    const bookmarkId = req.params.id;
    const userId = req.userId;

    const bookmark = await Bookmark.findById(bookmarkId);

    if (!bookmark) {
      return res.status(404).json({ error: '书签不存在' });
    }

    // 检查是否已经收藏
    if (bookmark.starredBy.includes(userId)) {
      return res.status(400).json({ error: '已经收藏过该书签' });
    }

    bookmark.starredBy.push(userId);
    bookmark.starCount = bookmark.starredBy.length;
    await bookmark.save();

    res.json({ message: '收藏成功', starCount: bookmark.starCount });
  } catch (error) {
    console.error('Star bookmark error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * DELETE /api/bookmarks/:id/star - 取消收藏
 */
async function unstar(req, res) {
  try {
    const bookmarkId = req.params.id;
    const userId = req.userId;

    const bookmark = await Bookmark.findById(bookmarkId);

    if (!bookmark) {
      return res.status(404).json({ error: '书签不存在' });
    }

    // 检查是否已收藏
    const starIndex = bookmark.starredBy.indexOf(userId);
    if (starIndex === -1) {
      return res.status(400).json({ error: '尚未收藏该书签' });
    }

    bookmark.starredBy.splice(starIndex, 1);
    bookmark.starCount = bookmark.starredBy.length;
    await bookmark.save();

    res.json({ message: '已取消收藏', starCount: bookmark.starCount });
  } catch (error) {
    console.error('Unstar bookmark error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * 同步标签计数
 */
async function syncTags(tags) {
  if (!tags || tags.length === 0) return;

  for (const tagName of tags) {
    const count = await Bookmark.countDocuments({ tags: tagName });
    await Tag.findOneAndUpdate(
      { name: tagName.toLowerCase() },
      { name: tagName.toLowerCase(), bookmarkCount: count },
      { upsert: true }
    );
  }
}

module.exports = {
  list,
  getOne,
  search,
  create,
  update,
  remove,
  star,
  unstar,
};