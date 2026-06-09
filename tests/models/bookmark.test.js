/**
 * Bookmark Model Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Bookmark = require('../../src/models/bookmark');
const User = require('../../src/models/user');

let mongoServer;
let testUser;

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
  await Bookmark.deleteMany({});
  await User.deleteMany({});

  testUser = await User.create({
    email: 'test@example.com',
    password: 'password123',
    apiKey: 'test-api-key',
  });
});

describe('Bookmark Model', () => {
  describe('Bookmark Creation', () => {
    test('should create a bookmark with valid data', async () => {
      const bookmarkData = {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'An example website',
        tags: ['tech', 'programming'],
        userId: testUser._id,
      };

      const bookmark = await Bookmark.create(bookmarkData);

      expect(bookmark.url).toBe('https://example.com');
      expect(bookmark.title).toBe('Example Site');
      expect(bookmark.description).toBe('An example website');
      expect(bookmark.tags).toEqual(['tech', 'programming']);
      expect(bookmark.userId.toString()).toBe(testUser._id.toString());
      expect(bookmark.starCount).toBe(0);
      expect(bookmark.starredBy).toEqual([]);
      expect(bookmark.createdAt).toBeDefined();
      expect(bookmark.updatedAt).toBeDefined();
    });

    test('should create bookmark with default values', async () => {
      const bookmarkData = {
        url: 'https://example.com',
        title: 'Example Site',
        userId: testUser._id,
      };

      const bookmark = await Bookmark.create(bookmarkData);

      expect(bookmark.description).toBe('');
      expect(bookmark.tags).toEqual([]);
      expect(bookmark.starCount).toBe(0);
    });

    test('should convert tags to lowercase', async () => {
      const bookmarkData = {
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['Tech', 'PROGRAMMING'],
        userId: testUser._id,
      };

      const bookmark = await Bookmark.create(bookmarkData);

      expect(bookmark.tags).toEqual(['tech', 'programming']);
    });

    test('should trim url and title whitespace', async () => {
      const bookmarkData = {
        url: '  https://example.com  ',
        title: '  Example Site  ',
        userId: testUser._id,
      };

      const bookmark = await Bookmark.create(bookmarkData);

      expect(bookmark.url).toBe('https://example.com');
      expect(bookmark.title).toBe('Example Site');
    });
  });

  describe('Validation', () => {
    test('should fail without url', async () => {
      const bookmarkData = {
        title: 'Example Site',
        userId: testUser._id,
      };

      await expect(Bookmark.create(bookmarkData)).rejects.toThrow();
    });

    test('should fail without title', async () => {
      const bookmarkData = {
        url: 'https://example.com',
        userId: testUser._id,
      };

      await expect(Bookmark.create(bookmarkData)).rejects.toThrow();
    });

    test('should fail without userId', async () => {
      const bookmarkData = {
        url: 'https://example.com',
        title: 'Example Site',
      };

      await expect(Bookmark.create(bookmarkData)).rejects.toThrow();
    });
  });

  describe('Starring functionality', () => {
    test('should allow starring a bookmark', async () => {
      const bookmark = await Bookmark.create({
        url: 'https://example.com',
        title: 'Example Site',
        userId: testUser._id,
      });

      bookmark.starredBy.push(testUser._id);
      bookmark.starCount = bookmark.starredBy.length;
      await bookmark.save();

      const retrievedBookmark = await Bookmark.findById(bookmark._id);

      expect(retrievedBookmark.starCount).toBe(1);
      expect(retrievedBookmark.starredBy.length).toBe(1);
      expect(retrievedBookmark.starredBy[0].toString()).toBe(testUser._id.toString());
    });

    test('should allow multiple users to star a bookmark', async () => {
      const secondUser = await User.create({
        email: 'test2@example.com',
        password: 'password456',
        apiKey: 'test-api-key-2',
      });

      const bookmark = await Bookmark.create({
        url: 'https://example.com',
        title: 'Example Site',
        userId: testUser._id,
      });

      bookmark.starredBy.push(testUser._id, secondUser._id);
      bookmark.starCount = bookmark.starredBy.length;
      await bookmark.save();

      const retrievedBookmark = await Bookmark.findById(bookmark._id);

      expect(retrievedBookmark.starCount).toBe(2);
      expect(retrievedBookmark.starredBy.length).toBe(2);
    });
  });

  describe('Text Search Index', () => {
    test('should support text search on title', async () => {
      await Bookmark.create({
        url: 'https://example.com',
        title: 'JavaScript Tutorial',
        userId: testUser._id,
      });

      await Bookmark.create({
        url: 'https://python.com',
        title: 'Python Guide',
        userId: testUser._id,
      });

      const results = await Bookmark.find({
        $text: { $search: 'JavaScript' },
      });

      expect(results.length).toBe(1);
      expect(results[0].title).toBe('JavaScript Tutorial');
    });

    test('should support text search on description', async () => {
      await Bookmark.create({
        url: 'https://example.com',
        title: 'Example Site',
        description: 'Learn React today',
        userId: testUser._id,
      });

      const results = await Bookmark.find({
        $text: { $search: 'React' },
      });

      expect(results.length).toBe(1);
      expect(results[0].description).toContain('React');
    });
  });
});