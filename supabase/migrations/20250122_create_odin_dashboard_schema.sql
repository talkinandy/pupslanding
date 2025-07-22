-- Create traders table
CREATE TABLE IF NOT EXISTS public.traders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  principal text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trader_snapshots table
CREATE TABLE IF NOT EXISTS public.trader_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id uuid REFERENCES public.traders(id) ON DELETE CASCADE NOT NULL,
  realized_pnl numeric NOT NULL DEFAULT 0,
  unrealized_pnl numeric NOT NULL DEFAULT 0,
  total_pnl numeric NOT NULL DEFAULT 0,
  rank integer NOT NULL,
  snapshot_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trader_positions table
CREATE TABLE IF NOT EXISTS public.trader_positions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id uuid REFERENCES public.traders(id) ON DELETE CASCADE NOT NULL,
  token_name text NOT NULL,
  amount numeric NOT NULL,
  entry_price numeric,
  current_price numeric,
  pnl numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create platform_stats table
CREATE TABLE IF NOT EXISTS public.platform_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date date NOT NULL UNIQUE,
  total_volume numeric NOT NULL DEFAULT 0,
  total_traders integer NOT NULL DEFAULT 0,
  active_traders integer NOT NULL DEFAULT 0,
  btc_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_traders_principal ON public.traders(principal);
CREATE INDEX IF NOT EXISTS idx_trader_snapshots_trader_id ON public.trader_snapshots(trader_id);
CREATE INDEX IF NOT EXISTS idx_trader_snapshots_date ON public.trader_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_trader_positions_trader_id ON public.trader_positions(trader_id);
CREATE INDEX IF NOT EXISTS idx_platform_stats_date ON public.platform_stats(stat_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access for dashboard)
CREATE POLICY "Allow public read access on traders" ON public.traders
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on trader_snapshots" ON public.trader_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on trader_positions" ON public.trader_positions
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on platform_stats" ON public.platform_stats
  FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_traders_updated_at
  BEFORE UPDATE ON public.traders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_trader_positions_updated_at
  BEFORE UPDATE ON public.trader_positions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create materialized view for leaderboard (for better performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard AS
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

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_principal ON public.leaderboard(principal);

-- Create function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;