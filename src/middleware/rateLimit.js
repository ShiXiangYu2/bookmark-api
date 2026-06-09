/**
 * Rate Limit Middleware - 频率限制中间件
 */

const rateLimit = require('express-rate-limit');

// 通用 API 频率限制：每分钟 60 次
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 60, // 每分钟最多 60 次
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 认证 API 频率限制：每分钟 10 次（防止暴力破解）
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 每分钟最多 10 次
  message: { error: '登录尝试过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
};