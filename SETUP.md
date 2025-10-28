# Setup Guide

## Quick Start with PostgreSQL

### 1. Database Setup

#### Option A: Using Docker (Recommended)

The project includes a `docker-compose.yml` file that will start PostgreSQL for you:

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with:

- Username: `postgres`
- Password: `postgres`
- Database: `off-peak`

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL on your system
2. Create a database:

```sql
CREATE DATABASE "off-peak";
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
PAYLOAD_SECRET=your-secret-key-here
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/off-peak
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=your-cron-secret
```

For Docker Compose:

```env
DATABASE_URI=postgresql://postgres:postgres@postgres:5432/off-peak
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Generate Types

```bash
pnpm generate:types
pnpm generate:importmap
```

### 5. Run Development Server

```bash
pnpm dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:3000/api/graphql

## Database Schema

The following tables will be created automatically by Payload CMS:

- `users` - User accounts with authentication
- `merchants` - Merchant business accounts
- `venues` - Venue locations and details
- `offers` - Offer definitions
- `offer_slots` - Time-based offer windows
- `claims` - User claims and redemptions
- `reviews` - User reviews
- `favorites` - User favorite venues
- `media` - File uploads

## Testing the Setup

1. Start the server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Create a user in the admin panel at http://localhost:3000/admin
4. Create a merchant account
5. Add a venue
6. Create an offer with slots
7. Browse offers at http://localhost:3000/offers

## Troubleshooting

### Connection Issues

If you see connection errors, check:

- PostgreSQL is running: `docker ps` (if using Docker)
- Connection string is correct in `.env`
- Database exists

### Port Conflicts

If port 3000 is in use:

```bash
PORT=3001 pnpm dev
```

### Schema Issues

If you make changes to collections:

```bash
pnpm generate:types
```

## Next Steps

1. Set up OTP authentication (Twilio, AWS SNS, etc.)
2. Configure Stripe for merchant payments
3. Set up cron jobs for expiring claims
4. Deploy to production
