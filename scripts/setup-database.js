#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Odin Dashboard database...');
  
  try {
    // Step 1: Create traders table
    console.log('📝 Creating traders table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.traders (
          id uuid default gen_random_uuid() primary key,
          principal text unique not null,
          name text not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
      `
    });

    // Step 2: Create trader_snapshots table
    console.log('📊 Creating trader_snapshots table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.trader_snapshots (
          id uuid default gen_random_uuid() primary key,
          trader_id uuid references public.traders(id) on delete cascade not null,
          realized_pnl numeric not null default 0,
          unrealized_pnl numeric not null default 0,
          total_pnl numeric not null default 0,
          rank integer not null,
          snapshot_date date not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
      `
    });

    // Step 3: Create trader_positions table
    console.log('💰 Creating trader_positions table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.trader_positions (
          id uuid default gen_random_uuid() primary key,
          trader_id uuid references public.traders(id) on delete cascade not null,
          token_name text not null,
          amount numeric not null,
          entry_price numeric,
          current_price numeric,
          pnl numeric not null default 0,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
      `
    });

    // Step 4: Create platform_stats table
    console.log('📈 Creating platform_stats table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.platform_stats (
          id uuid default gen_random_uuid() primary key,
          stat_date date not null unique,
          total_volume numeric not null default 0,
          total_traders integer not null default 0,
          active_traders integer not null default 0,
          btc_price numeric not null default 0,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
      `
    });

    console.log('✅ Database tables created successfully!');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    
    // Try alternative approach using direct SQL execution
    console.log('🔄 Trying alternative approach...');
    await setupDatabaseAlternative();
  }
}

async function setupDatabaseAlternative() {
  try {
    // Create tables using direct SQL queries
    const tables = [
      {
        name: 'traders',
        sql: `
          CREATE TABLE IF NOT EXISTS public.traders (
            id uuid default gen_random_uuid() primary key,
            principal text unique not null,
            name text not null,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            updated_at timestamp with time zone default timezone('utc'::text, now()) not null
          );
        `
      },
      {
        name: 'trader_snapshots', 
        sql: `
          CREATE TABLE IF NOT EXISTS public.trader_snapshots (
            id uuid default gen_random_uuid() primary key,
            trader_id uuid references public.traders(id) on delete cascade not null,
            realized_pnl numeric not null default 0,
            unrealized_pnl numeric not null default 0,
            total_pnl numeric not null default 0,
            rank integer not null,
            snapshot_date date not null,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null
          );
        `
      },
      {
        name: 'trader_positions',
        sql: `
          CREATE TABLE IF NOT EXISTS public.trader_positions (
            id uuid default gen_random_uuid() primary key,
            trader_id uuid references public.traders(id) on delete cascade not null,
            token_name text not null,
            amount numeric not null,
            entry_price numeric,
            current_price numeric,
            pnl numeric not null default 0,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            updated_at timestamp with time zone default timezone('utc'::text, now()) not null
          );
        `
      },
      {
        name: 'platform_stats',
        sql: `
          CREATE TABLE IF NOT EXISTS public.platform_stats (
            id uuid default gen_random_uuid() primary key,
            stat_date date not null unique,
            total_volume numeric not null default 0,
            total_traders integer not null default 0,
            active_traders integer not null default 0,
            btc_price numeric not null default 0,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null
          );
        `
      }
    ];

    for (const table of tables) {
      console.log(`📝 Creating ${table.name} table...`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      if (error) {
        console.error(`❌ Error creating ${table.name}:`, error);
      }
    }

    console.log('✅ Database setup completed!');
    console.log('🎯 You can now test the dashboard connection');
    
  } catch (error) {
    console.error('❌ Alternative setup failed:', error.message);
    console.log('💡 Please run the schema.sql manually in Supabase SQL Editor');
  }
}

// Run the setup
setupDatabase().catch(console.error);