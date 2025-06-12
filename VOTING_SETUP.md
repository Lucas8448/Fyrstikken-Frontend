# Voting System Setup

This Next.js application has been converted to use Supabase as the database backend instead of the original Flask + SQLite setup.

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Settings > API and copy your project URL and anon key
3. Go to SQL Editor and run the migration script from `supabase-migration.sql`

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
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

## Database Schema

### Users Table

- `id` (SERIAL PRIMARY KEY)
- `email` (TEXT UNIQUE NOT NULL)
- `verification_code` (TEXT)
- `code_expiry` (BIGINT)
- `contestant_voted` (INTEGER)
- `created_at` (TIMESTAMP)

### Tokens Table

- `token` (TEXT PRIMARY KEY)
- `email` (TEXT NOT NULL)
- `created_at` (TIMESTAMP)

## Security Features

- Email verification with time-limited codes (10 minutes)
- Token-based authentication
- One vote per user restriction
- Allowed email list restriction
- Row Level Security (RLS) in Supabase

## Migration from Flask

The original Flask application has been converted to:

- Next.js API routes instead of Flask routes
- Supabase PostgreSQL instead of SQLite
- Node.js nodemailer instead of Python smtplib
- TypeScript for better type safety
