export interface Database {
  public: {
    Tables: {
      traders: {
        Row: {
          id: string
          principal: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          principal: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          principal?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      trader_snapshots: {
        Row: {
          id: string
          trader_id: string
          realized_pnl: number
          unrealized_pnl: number
          total_pnl: number
          rank: number
          snapshot_date: string
          created_at: string
        }
        Insert: {
          id?: string
          trader_id: string
          realized_pnl?: number
          unrealized_pnl?: number
          total_pnl?: number
          rank: number
          snapshot_date: string
          created_at?: string
        }
        Update: {
          id?: string
          trader_id?: string
          realized_pnl?: number
          unrealized_pnl?: number
          total_pnl?: number
          rank?: number
          snapshot_date?: string
          created_at?: string
        }
      }
      trader_positions: {
        Row: {
          id: string
          trader_id: string
          token_name: string
          amount: number
          entry_price: number | null
          current_price: number | null
          pnl: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trader_id: string
          token_name: string
          amount: number
          entry_price?: number | null
          current_price?: number | null
          pnl?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trader_id?: string
          token_name?: string
          amount?: number
          entry_price?: number | null
          current_price?: number | null
          pnl?: number
          created_at?: string
          updated_at?: string
        }
      }
      platform_stats: {
        Row: {
          id: string
          stat_date: string
          total_volume: number
          total_traders: number
          active_traders: number
          btc_price: number
          created_at: string
        }
        Insert: {
          id?: string
          stat_date: string
          total_volume?: number
          total_traders?: number
          active_traders?: number
          btc_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          stat_date?: string
          total_volume?: number
          total_traders?: number
          active_traders?: number
          btc_price?: number
          created_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          principal: string
          name: string
          realized_pnl: number
          unrealized_pnl: number
          total_pnl: number
          rank: number
          snapshot_date: string
        }
      }
    }
    Functions: {
      refresh_leaderboard: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}

// Convenience types
export type Trader = Database['public']['Tables']['traders']['Row']
export type TraderSnapshot = Database['public']['Tables']['trader_snapshots']['Row']
export type TraderPosition = Database['public']['Tables']['trader_positions']['Row']
export type PlatformStats = Database['public']['Tables']['platform_stats']['Row']
export type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']

// Combined types for dashboard
export interface DashboardTrader extends LeaderboardEntry {
  rank: number
}

export interface DashboardStats {
  totalTraders: number
  totalVolume: string
  topGainer: DashboardTrader | null
  activeNow: number
}