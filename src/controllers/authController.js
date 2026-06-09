/**
 * Auth Controller - 认证控制器
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');

/**
 * 生成 API Key
 */
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/auth/register - 用户注册
 */
async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(password, 10);

    // 生成 API Key
    const apiKey = generateApiKey();

    // 创建用户
    const user = new User({
      email: email.toLowerCase(),
      password: passwordHash,
      apiKey,
    });

    await user.save();

    res.status(201).json({
      message: '注册成功',
      apiKey,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * POST /api/auth/login - 用户登录
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    // 查找用户
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    res.json({
      message: '登录成功',
      apiKey: user.apiKey,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

/**
 * POST /api/auth/regenerate-key - 重新生成 API Key
 */
async function regenerateKey(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const newApiKey = generateApiKey();
    user.apiKey = newApiKey;
    await user.save();

    res.json({
      message: 'API Key 已重新生成',
      apiKey: newApiKey,
    });
  } catch (error) {
    console.error('Regenerate key error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

module.exports = {
  register,
  login,
  regenerateKey,
};