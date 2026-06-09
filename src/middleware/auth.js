/**
 * Auth Middleware - 认证中间件（基础版本，Issue #4 将完善）
 */

const { User } = require('../models');

/**
 * API Key 认证中间件
 */
async function authMiddleware(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: '需要 API Key' });
    }

    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(401).json({ error: '无效的 API Key' });
    }

    req.userId = user._id.toString();
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

module.exports = {
  authMiddleware,
};