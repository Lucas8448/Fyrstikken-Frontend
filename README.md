# Fyrstikken Voting App

A Next.js voting application for design competitions, now powered by Supabase.

## Features

- Email-based authentication for voting
- Category-based project voting
- Admin results dashboard
- Year-based competition management
- Real-time vote tracking

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account
- Email provider (Gmail recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fyrstikken-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Allowed emails for voting (comma-separated)
ALLOWED_MAILS=user1@example.com,user2@example.com

# Voting period
VOTING_START_DATE=2025-06-15
VOTING_END_DATE=2025-06-20

# Domain
NEXT_PUBLIC_DOMAIN=http://localhost:3000
```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the SQL migration to create the required tables:
```sql
-- Copy the contents of supabase-migration.sql and run in Supabase SQL editor
```

3. Initialize the database with categories and projects:
```bash
npm run init-db
```

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize Supabase database with categories and projects

## Database Schema

The app uses the following Supabase tables:

- `access_codes` - Email verification codes
- `votes` - User votes for projects
- `projects` - Project data imported from JSON files
- `categories` - Category information

## Voting Flow

1. User enters email address
2. System sends verification code (if email is in ALLOWED_MAILS)
3. User enters code to gain access
4. User votes on projects in different categories
5. Votes are stored in Supabase
6. Admin can view results dashboard

## Migration from Redis

This app was migrated from Redis/Vercel KV to Supabase. The migration includes:

- Database initialization via npm script instead of API endpoint
- All Redis operations replaced with Supabase queries
- Improved data persistence and querying capabilities
- SQL-based analytics for results

## Deployment

1. Deploy to Vercel:
```bash
npm run build
```

2. Set environment variables in Vercel dashboard

3. Ensure Supabase project is configured and migration is run

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]
