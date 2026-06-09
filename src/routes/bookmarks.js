/**
 * Bookmark Routes - 书签路由
 */

const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/bookmarks - 获取书签列表 (公开)
router.get('/', bookmarkController.list);

// GET /api/bookmarks/:id - 获取单个书签 (公开)
router.get('/:id', bookmarkController.getOne);

// POST /api/bookmarks - 创建书签 (需登录)
router.post('/', authMiddleware, bookmarkController.create);

// PUT /api/bookmarks/:id - 更新书签 (需登录，创建者)
router.put('/:id', authMiddleware, bookmarkController.update);

// DELETE /api/bookmarks/:id - 删除书签 (需登录，创建者)
router.delete('/:id', authMiddleware, bookmarkController.remove);

module.exports = router;