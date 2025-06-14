# Voting System Setup

This Next.js application uses **Redis** as the database backend for a simple and reliable voting system.

## Setup Instructions

### 1. Redis Setup

**Option A: Redis Cloud (Recommended)**

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Create a new database
4. Copy the Redis URL (format: `redis://default:password@host:port`)

**Option B: Other Redis Providers**

- Upstash Redis
- Railway Redis
- Local Redis

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Redis URL:

   ```
   REDIS_URL=redis://default:password@host:port
   ```

3. Configure email settings:

   ```
   EMAIL_SENDER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

   Note: For Gmail, you'll need to generate an app password instead of using your regular password.

4. Set allowed emails:
   ```
   ALLOWED_MAILS=user1@example.com,user2@example.com,user3@example.com
   ```

## API Endpoints

### POST /api/access

- **Purpose**: Handle user authentication via email verification
- **Body**:
  - Without code: `{ "email": "user@example.com" }` - Sends verification code
  - With code: `{ "email": "user@example.com", "code": "123456" }` - Verifies code and returns token

### POST /api/vote

- **Purpose**: Record user votes
- **Body**: `{ "token": "user_token", "contestant_id": "123" }`

### GET /api/results

- **Purpose**: Get voting results
- **Returns**: Object with contestant IDs as keys and vote counts as values

## Data Structure (Vercel KV)

### User Data

Stored as `user:{email}`:

```json
{
  "email": "user@example.com",
  "verificationCode": "123456",
  "codeExpiry": 1234567890,
  "contestantVoted": "project123",
  "createdAt": 1234567890
}
```

### Token Data

Stored as `token:{token}`:

```json
{
  "email": "user@example.com",
  "createdAt": 1234567890
}
```

### Vote Counts

Stored as `vote_counts` (hash):

```json
{
  "project123": 5,
  "project456": 3,
  "project789": 8
}
```

## Security Features

- Email verification with time-limited codes (10 minutes)
- Token-based authentication with automatic expiry (24 hours)
- One vote per user restriction
- Allowed email list restriction
- Redis-based storage with automatic cleanup

## Benefits of Upstash Redis

- ✅ **Free Tier**: 10,000 requests/day free
- ✅ **Lightning Fast**: Redis-based storage
- ✅ **Global Edge**: Fast from anywhere
- ✅ **Simple Setup**: Just copy 2 environment variables
- ✅ **Built-in Expiry**: Tokens auto-expire
- ✅ **No SQL Required**: Simple key-value operations
- ✅ **Serverless**: Pay only for what you use
