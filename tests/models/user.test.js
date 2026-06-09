/**
 * User Model Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user');

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
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        apiKey: 'test-api-key-123',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
      expect(user.password).not.toBe('password123'); // Password should be hashed
      expect(user.apiKey).toBe('test-api-key-123');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'plaintextpassword',
        apiKey: 'test-api-key',
      };

      await User.create(userData);
      const retrievedUser = await User.findOne({ email: 'test@example.com' }).select('+password');

      expect(retrievedUser.password).not.toBe('plaintextpassword');
      expect(retrievedUser.password.startsWith('$2')).toBe(true); // bcrypt hash prefix
    });

    test('should convert email to lowercase', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        apiKey: 'test-api-key',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    test('should trim email whitespace', async () => {
      const userData = {
        email: '  test@example.com  ',
        password: 'password123',
        apiKey: 'test-api-key',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });
  });

  describe('comparePassword', () => {
    test('should return true for correct password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'correctpassword',
        apiKey: 'test-api-key',
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword('correctpassword');

      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'correctpassword',
        apiKey: 'test-api-key',
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword('wrongpassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('Validation', () => {
    test('should fail without email', async () => {
      const userData = {
        password: 'password123',
        apiKey: 'test-api-key',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should fail without password', async () => {
      const userData = {
        email: 'test@example.com',
        apiKey: 'test-api-key',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should fail without apiKey', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        apiKey: 'test-api-key-1',
      };

      await User.create(userData);

      const duplicateUser = {
        email: 'test@example.com',
        password: 'password456',
        apiKey: 'test-api-key-2',
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    test('should fail with duplicate apiKey', async () => {
      const userData = {
        email: 'test1@example.com',
        password: 'password123',
        apiKey: 'test-api-key',
      };

      await User.create(userData);

      const duplicateApiKey = {
        email: 'test2@example.com',
        password: 'password456',
        apiKey: 'test-api-key',
      };

      await expect(User.create(duplicateApiKey)).rejects.toThrow();
    });
  });

  describe('Password not selected by default', () => {
    test('should not include password in default queries', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        apiKey: 'test-api-key',
      };

      await User.create(userData);
      const user = await User.findOne({ email: 'test@example.com' });

      expect(user.password).toBeUndefined();
    });

    test('should include password when explicitly selected', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        apiKey: 'test-api-key',
      };

      await User.create(userData);
      const user = await User.findOne({ email: 'test@example.com' }).select('+password');

      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('password123');
    });
  });
});