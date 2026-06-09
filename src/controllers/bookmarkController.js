/**
 * Bookmark Controller - 书签控制器
 */

const { Bookmark } = require('../models');

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

    res.json({ message: '书签已删除' });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};