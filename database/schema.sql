-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-secret-jwt-token-with-at-least-32-characters-long';

-- Create traders table
create table public.traders (
  id uuid default gen_random_uuid() primary key,
  principal text unique not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trader_snapshots table for historical data
create table public.trader_snapshots (
  id uuid default gen_random_uuid() primary key,
  trader_id uuid references public.traders(id) on delete cascade not null,
  realized_pnl numeric not null default 0,
  unrealized_pnl numeric not null default 0,
  total_pnl numeric not null default 0,
  rank integer not null,
  snapshot_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trader_positions table for current holdings
create table public.trader_positions (
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

-- Create platform_stats table for overall metrics
create table public.platform_stats (
  id uuid default gen_random_uuid() primary key,
  stat_date date not null unique,
  total_volume numeric not null default 0,
  total_traders integer not null default 0,
  active_traders integer not null default 0,
  btc_price numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_traders_principal on public.traders(principal);
create index idx_trader_snapshots_trader_id on public.trader_snapshots(trader_id);
create index idx_trader_snapshots_date on public.trader_snapshots(snapshot_date desc);
create index idx_trader_positions_trader_id on public.trader_positions(trader_id);
create index idx_platform_stats_date on public.platform_stats(stat_date desc);

-- Enable Row Level Security (RLS)
alter table public.traders enable row level security;
alter table public.trader_snapshots enable row level security;
alter table public.trader_positions enable row level security;
alter table public.platform_stats enable row level security;

-- Create policies (allow public read access for dashboard)
create policy "Allow public read access on traders" on public.traders
  for select using (true);

create policy "Allow public read access on trader_snapshots" on public.trader_snapshots
  for select using (true);

create policy "Allow public read access on trader_positions" on public.trader_positions
  for select using (true);

create policy "Allow public read access on platform_stats" on public.platform_stats
  for select using (true);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language 'plpgsql';

-- Create triggers for updated_at
create trigger update_traders_updated_at
  before update on public.traders
  for each row execute procedure update_updated_at_column();

create trigger update_trader_positions_updated_at
  before update on public.trader_positions
  for each row execute procedure update_updated_at_column();

-- Create materialized view for leaderboard (for better performance)
create materialized view public.leaderboard as
select 
  t.principal,
  t.name,
  ts.realized_pnl,
  ts.unrealized_pnl,
  ts.total_pnl,
  ts.rank,
  ts.snapshot_date
from public.traders t
join public.trader_snapshots ts on t.id = ts.trader_id
where ts.snapshot_date = (
  select max(snapshot_date) 
  from public.trader_snapshots 
  where trader_id = t.id
)
order by ts.rank asc;

-- Create index on materialized view
create unique index idx_leaderboard_principal on public.leaderboard(principal);

-- Create function to refresh leaderboard
create or replace function refresh_leaderboard()
returns void as $$
begin
  refresh materialized view concurrently public.leaderboard;
end;
$$ language plpgsql security definer;