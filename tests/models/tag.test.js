/**
 * Tag Model Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Tag = require('../../src/models/tag');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Tag.deleteMany({});
});

describe('Tag Model', () => {
  describe('Tag Creation', () => {
    test('should create a tag with valid data', async () => {
      const tagData = {
        name: 'javascript',
      };

      const tag = await Tag.create(tagData);

      expect(tag.name).toBe('javascript');
      expect(tag.bookmarkCount).toBe(0);
      expect(tag.createdAt).toBeDefined();
    });

    test('should create tag with custom bookmarkCount', async () => {
      const tagData = {
        name: 'popular-tag',
        bookmarkCount: 100,
      };

      const tag = await Tag.create(tagData);

      expect(tag.bookmarkCount).toBe(100);
    });

    test('should convert name to lowercase', async () => {
      const tagData = {
        name: 'JAVASCRIPT',
      };

      const tag = await Tag.create(tagData);

      expect(tag.name).toBe('javascript');
    });

    test('should trim name whitespace', async () => {
      const tagData = {
        name: '  javascript  ',
      };

      const tag = await Tag.create(tagData);

      expect(tag.name).toBe('javascript');
    });
  });

  describe('Validation', () => {
    test('should fail without name', async () => {
      await expect(Tag.create({})).rejects.toThrow();
    });

    test('should fail with duplicate name', async () => {
      await Tag.create({ name: 'javascript' });

      await expect(Tag.create({ name: 'javascript' })).rejects.toThrow();
    });

    test('should fail with duplicate name (case insensitive)', async () => {
      await Tag.create({ name: 'javascript' });

      await expect(Tag.create({ name: 'JAVASCRIPT' })).rejects.toThrow();
    });
  });

  describe('BookmarkCount', () => {
    test('should allow updating bookmarkCount', async () => {
      const tag = await Tag.create({ name: 'test-tag' });

      tag.bookmarkCount = 50;
      await tag.save();

      const retrievedTag = await Tag.findOne({ name: 'test-tag' });

      expect(retrievedTag.bookmarkCount).toBe(50);
    });
  });

  describe('Sorting by popularity', () => {
    test('should sort tags by bookmarkCount descending', async () => {
      await Tag.create({ name: 'tag1', bookmarkCount: 10 });
      await Tag.create({ name: 'tag2', bookmarkCount: 50 });
      await Tag.create({ name: 'tag3', bookmarkCount: 30 });

      const tags = await Tag.find().sort({ bookmarkCount: -1 });

      expect(tags[0].name).toBe('tag2');
      expect(tags[1].name).toBe('tag3');
      expect(tags[2].name).toBe('tag1');
    });
  });
});