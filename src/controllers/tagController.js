/**
 * Tag Controller - 标签控制器
 */

const { Tag, Bookmark } = require('../models');

/**
 * GET /api/tags - 获取所有标签
 */
async function list(req, res) {
  try {
    const tags = await Tag.find().sort({ bookmarkCount: -1 });
    res.json(tags);
  } catch (error) {
    console.error('List tags error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * GET /api/tags/popular - 获取热门标签
 */
async function popular(req, res) {
  try {
    const { limit = 10 } = req.query;
    const tags = await Tag.find()
      .sort({ bookmarkCount: -1 })
      .limit(parseInt(limit));
    res.json(tags);
  } catch (error) {
    console.error('Popular tags error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * 同步标签计数
 */
async function syncTagCounts() {
  try {
    const tagCounts = await Bookmark.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]);

    for (const tagData of tagCounts) {
      await Tag.findOneAndUpdate(
        { name: tagData._id },
        { name: tagData._id, bookmarkCount: tagData.count },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Sync tag counts error:', error);
  }
}

module.exports = {
  list,
  popular,
  syncTagCounts,
};