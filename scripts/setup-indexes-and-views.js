#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupIndexesAndViews() {
  console.log('🔧 Setting up indexes and materialized views...');
  
  try {
    // Create indexes
    console.log('📚 Creating database indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_traders_principal ON public.traders(principal);',
      'CREATE INDEX IF NOT EXISTS idx_trader_snapshots_trader_id ON public.trader_snapshots(trader_id);',
      'CREATE INDEX IF NOT EXISTS idx_trader_snapshots_date ON public.trader_snapshots(snapshot_date DESC);',
      'CREATE INDEX IF NOT EXISTS idx_trader_positions_trader_id ON public.trader_positions(trader_id);',
      'CREATE INDEX IF NOT EXISTS idx_platform_stats_date ON public.platform_stats(stat_date DESC);'
    ];

    for (const indexSql of indexes) {
      await supabase.rpc('exec_sql', { sql: indexSql });
    }

    // Create updated_at function
    console.log('⚙️ Creating updated_at function...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    // Create triggers
    console.log('🔄 Creating update triggers...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS update_traders_updated_at ON public.traders;
        CREATE TRIGGER update_traders_updated_at
          BEFORE UPDATE ON public.traders
          FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      `
    });

    await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS update_trader_positions_updated_at ON public.trader_positions;
        CREATE TRIGGER update_trader_positions_updated_at
          BEFORE UPDATE ON public.trader_positions
          FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
      `
    });

    // Create materialized view
    console.log('👀 Creating leaderboard materialized view...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP MATERIALIZED VIEW IF EXISTS public.leaderboard;
        CREATE MATERIALIZED VIEW public.leaderboard AS
        SELECT 
          t.principal,
          t.name,
          COALESCE(ts.realized_pnl, 0) as realized_pnl,
          COALESCE(ts.unrealized_pnl, 0) as unrealized_pnl,
          COALESCE(ts.total_pnl, 0) as total_pnl,
          COALESCE(ts.rank, 999) as rank,
          COALESCE(ts.snapshot_date, CURRENT_DATE) as snapshot_date
        FROM public.traders t
        LEFT JOIN public.trader_snapshots ts ON t.id = ts.trader_id
          AND ts.snapshot_date = (
            SELECT MAX(snapshot_date) 
            FROM public.trader_snapshots 
            WHERE trader_id = t.id
          )
        ORDER BY COALESCE(ts.rank, 999) ASC;
      `
    });

    // Create refresh function
    console.log('🔄 Creating refresh function...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION refresh_leaderboard()
        RETURNS void AS $$
        BEGIN
          REFRESH MATERIALIZED VIEW public.leaderboard;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    console.log('✅ Indexes and views created successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up indexes and views:', error);
  }
}

setupIndexesAndViews().catch(console.error);