/**
 * Tag Routes - 标签路由
 */

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// GET /api/tags - 获取所有标签 (公开)
router.get('/', tagController.list);

// GET /api/tags/popular - 获取热门标签 (公开)
router.get('/popular', tagController.popular);

module.exports = router;