/**
 * Bookmark Model - 书签模型
 */

const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  tags: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  starCount: {
    type: Number,
    default: 0,
  },
  starredBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search
bookmarkSchema.index({ title: 'text', description: 'text', url: 'text' });
bookmarkSchema.index({ tags: 1 });
bookmarkSchema.index({ userId: 1 });
bookmarkSchema.index({ starCount: -1 });

// Update updatedAt before saving
bookmarkSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);