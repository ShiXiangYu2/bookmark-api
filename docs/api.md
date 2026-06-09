# Bookmark API Documentation

公开书签导航 API - 基于 Node.js + Express + MongoDB

## Base URL

```
http://localhost:3000/api
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bookmark-api` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Authentication

This API uses API Key authentication. Include your API key in the `X-API-Key` header for authenticated requests.

### Headers

```
X-API-Key: your-api-key-here
```

## Endpoints

### Health Check

#### `GET /health`

Check if the API is running.

**Response**

```json
{
  "status": "ok"
}
```

---

### Authentication

#### `POST /auth/register`

Register a new user account.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "apiKey": "your-api-key"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email (unique, lowercase) |
| `password` | string | Yes | User password (will be hashed) |
| `apiKey` | string | Yes | API key for authentication (unique) |

**Response (201 Created)**

```json
{
  "message": "User registered successfully",
  "userId": "64a1b2c3d4e5f6a7b8c9d0e1"
}
```

---

#### `POST /auth/login`

Login with email and password.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK)**

```json
{
  "message": "Login successful",
  "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "apiKey": "your-api-key"
}
```

---

### Bookmarks

#### `GET /bookmarks`

Get all bookmarks for the authenticated user.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `tag` | string | - | Filter by tag |
| `search` | string | - | Text search (title, description, url) |

**Response (200 OK)**

```json
{
  "bookmarks": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
      "url": "https://example.com",
      "title": "Example Site",
      "description": "An example website",
      "tags": ["tech", "programming"],
      "starCount": 5,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

#### `GET /bookmarks/:id`

Get a specific bookmark by ID.

**Response (200 OK)**

```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
  "url": "https://example.com",
  "title": "Example Site",
  "description": "An example website",
  "tags": ["tech", "programming"],
  "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "starCount": 5,
  "starredBy": ["64a1b2c3d4e5f6a7b8c9d0e3"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### `POST /bookmarks`

Create a new bookmark.

**Request Body**

```json
{
  "url": "https://example.com",
  "title": "Example Site",
  "description": "An example website",
  "tags": ["tech", "programming"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Bookmark URL |
| `title` | string | Yes | Bookmark title |
| `description` | string | No | Bookmark description |
| `tags` | string[] | No | Array of tags (lowercase) |

**Response (201 Created)**

```json
{
  "message": "Bookmark created",
  "bookmark": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "url": "https://example.com",
    "title": "Example Site",
    "description": "An example website",
    "tags": ["tech", "programming"],
    "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
    "starCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### `PUT /bookmarks/:id`

Update an existing bookmark.

**Request Body**

```json
{
  "url": "https://updated-example.com",
  "title": "Updated Example Site",
  "description": "Updated description",
  "tags": ["tech", "updated"]
}
```

**Response (200 OK)**

```json
{
  "message": "Bookmark updated",
  "bookmark": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "url": "https://updated-example.com",
    "title": "Updated Example Site",
    "description": "Updated description",
    "tags": ["tech", "updated"]
  }
}
```

---

#### `DELETE /bookmarks/:id`

Delete a bookmark.

**Response (200 OK)**

```json
{
  "message": "Bookmark deleted"
}
```

---

#### `POST /bookmarks/:id/star`

Star/unstar a bookmark.

**Response (200 OK)**

```json
{
  "message": "Bookmark starred",
  "starCount": 6
}
```

---

### Tags

#### `GET /tags`

Get all tags sorted by popularity.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Maximum number of tags to return |

**Response (200 OK)**

```json
{
  "tags": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
      "name": "javascript",
      "bookmarkCount": 150
    },
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e4",
      "name": "python",
      "bookmarkCount": 120
    }
  ]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error |

---

## Data Models

### User

```javascript
{
  _id: ObjectId,
  email: String,        // unique, lowercase
  password: String,     // hashed with bcrypt
  apiKey: String,       // unique, for authentication
  createdAt: Date,
  updatedAt: Date
}
```

### Bookmark

```javascript
{
  _id: ObjectId,
  url: String,          // required
  title: String,        // required
  description: String,
  tags: String[],       // lowercase
  userId: ObjectId,     // reference to User
  starCount: Number,
  starredBy: ObjectId[], // array of User references
  createdAt: Date,
  updatedAt: Date
}
```

### Tag

```javascript
{
  _id: ObjectId,
  name: String,         // unique, lowercase
  bookmarkCount: Number,
  createdAt: Date
}
```

---

## Indexes

The following indexes are defined for optimal query performance:

- **Bookmark**
  - Text index on `title`, `description`, `url`
  - Index on `tags`
  - Index on `userId`
  - Index on `starCount` (descending)

- **Tag**
  - Index on `bookmarkCount` (descending)

- **User**
  - Index on `email` (unique)
  - Index on `apiKey` (unique)