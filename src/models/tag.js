/**
 * Tag Model - 标签模型
 */

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  bookmarkCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for sorting by popularity
tagSchema.index({ bookmarkCount: -1 });

module.exports = mongoose.model('Tag', tagSchema);