# Database Setup

This directory contains the database schema and setup instructions for the Odin Dashboard.

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings → API to get your credentials

### 2. Configure Environment Variables

Copy your Supabase credentials to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Run the SQL script to create all tables, indexes, and functions

### 4. Database Structure

The database includes the following tables:

#### `traders`
- Stores trader identities (principal addresses and display names)

#### `trader_snapshots` 
- Historical P&L data for each trader by date
- Enables time-based filtering (24h, 7d, 30d, all)

#### `trader_positions`
- Current token holdings for each trader
- Tracks individual position P&L

#### `platform_stats`
- Daily aggregated platform metrics
- Total volume, trader counts, BTC price

#### `leaderboard` (Materialized View)
- Optimized view for dashboard display
- Contains latest snapshot data for all traders

### 5. Data Population

The database is designed to be populated by a background service that:

1. Fetches trader data from Odin API
2. Calculates P&L for each trader
3. Updates daily snapshots
4. Refreshes the leaderboard view

### 6. Security

- Row Level Security (RLS) is enabled
- Public read access is allowed for dashboard data
- Write operations require service role key

### 7. Performance

- Indexes on frequently queried columns
- Materialized view for fast leaderboard queries
- Automatic `updated_at` timestamp triggers

## Next Steps

1. Set up your Supabase credentials in `.env.local`
2. Run the schema.sql in Supabase SQL Editor
3. Test the connection with the dashboard
4. Implement data aggregation service using GitHub Actions