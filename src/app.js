/**
 * Bookmark API - 公开书签导航
 * 基础架构初始化
 */

const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;