/**
 * Auth Routes - 认证路由
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/register - 用户注册 (公开)
router.post('/register', authController.register);

// POST /api/auth/login - 用户登录 (公开)
router.post('/login', authController.login);

// POST /api/auth/regenerate-key - 重新生成 API Key (需登录)
router.post('/regenerate-key', authMiddleware, authController.regenerateKey);

module.exports = router;