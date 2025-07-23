import { supabase } from './supabase'
import type { DashboardTrader, DashboardStats, LeaderboardEntry } from '@/types/database'

export class DatabaseService {
  
  /**
   * Get current leaderboard data
   */
  static async getLeaderboard(limit: number = 100): Promise<DashboardTrader[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching leaderboard:', error)
        throw error
      }

      return data?.map((entry, index) => ({
        ...entry,
        rank: entry.rank || index + 1
      })) || []
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      return []
    }
  }

  /**
   * Get timeframe-specific leaderboard data
   */
  static async getTimeframeLeaderboard(timeframe: '24h' | '7d', limit: number = 200): Promise<DashboardTrader[]> {
    try {
      // Calculate the snapshot date for each timeframe
      const today = new Date()
      let snapshotDate: string
      
      switch (timeframe) {
        case '24h':
          snapshotDate = today.toISOString().split('T')[0]
          break
        case '7d':
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          snapshotDate = yesterday.toISOString().split('T')[0]
          break
        default:
          snapshotDate = today.toISOString().split('T')[0]
      }

      const { data, error } = await supabase
        .from('trader_snapshots')
        .select(`
          realized_pnl,
          unrealized_pnl,
          total_pnl,
          rank,
          snapshot_date,
          traders!inner(
            principal,
            name
          )
        `)
        .eq('snapshot_date', snapshotDate)
        .order('rank', { ascending: true })
        .limit(limit)

      if (error) {
        console.error(`Supabase error for ${timeframe}:`, error)
        return []
      }

      if (!data || data.length === 0) {
        console.warn(`No ${timeframe} data found for date: ${snapshotDate}`)
        return []
      }

      // Transform the data to match DashboardTrader interface
      return data.map(item => {
        const trader = Array.isArray(item.traders) ? item.traders[0] : item.traders;
        return {
          principal: trader.principal,
          name: trader.name,
          realized_pnl: Number(item.realized_pnl),
          unrealized_pnl: Number(item.unrealized_pnl),
          total_pnl: Number(item.total_pnl),
          rank: item.rank,
          snapshot_date: item.snapshot_date
        };
      })
    } catch (error) {
      console.error(`Failed to fetch ${timeframe} leaderboard:`, error)
      return []
    }
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats(): Promise<DashboardStats> {
    try {
      // Get latest platform stats
      const { data: statsData, error: statsError } = await supabase
        .from('platform_stats')
        .select('*')
        .order('stat_date', { ascending: false })
        .limit(1)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching platform stats:', statsError)
      }

      // Get top trader from leaderboard
      const { data: topTrader, error: traderError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(1)
        .single()

      if (traderError && traderError.code !== 'PGRST116') {
        console.error('Error fetching top trader:', traderError)
      }

      // Fallback to default values if no data
      const defaultStats = {
        totalTraders: 100,
        totalVolume: '50.97 BTC',
        activeNow: Math.floor(Math.random() * 500) + 100
      }

      return {
        totalTraders: statsData?.total_traders || defaultStats.totalTraders,
        totalVolume: statsData?.total_volume 
          ? `${Number(statsData.total_volume).toFixed(2)} BTC` 
          : defaultStats.totalVolume,
        topGainer: topTrader ? { ...topTrader, rank: 1 } : null,
        activeNow: statsData?.active_traders || defaultStats.activeNow
      }
    } catch (error) {
      console.error('Failed to fetch platform stats:', error)
      
      // Return fallback data
      return {
        totalTraders: 100,
        totalVolume: '50.97 BTC',
        topGainer: null,
        activeNow: Math.floor(Math.random() * 500) + 100
      }
    }
  }

  /**
   * Search traders by name or principal
   */
  static async searchTraders(query: string, limit: number = 50): Promise<DashboardTrader[]> {
    if (!query.trim()) {
      return this.getLeaderboard(limit)
    }

    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .or(`name.ilike.%${query}%,principal.ilike.%${query}%`)
        .order('rank', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error searching traders:', error)
        throw error
      }

      return data?.map((entry, index) => ({
        ...entry,
        rank: entry.rank || index + 1
      })) || []
    } catch (error) {
      console.error('Failed to search traders:', error)
      return []
    }
  }

  /**
   * Refresh the leaderboard materialized view
   */
  static async refreshLeaderboard(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('refresh_leaderboard')
      
      if (error) {
        console.error('Error refreshing leaderboard:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error)
      return false
    }
  }

  /**
   * Get trader details with positions
   */
  static async getTraderDetails(principal: string) {
    try {
      // Get trader info
      const { data: trader, error: traderError } = await supabase
        .from('traders')
        .select('*')
        .eq('principal', principal)
        .single()

      if (traderError) {
        console.error('Error fetching trader:', traderError)
        throw traderError
      }

      // Get trader positions
      const { data: positions, error: positionsError } = await supabase
        .from('trader_positions')
        .select('*')
        .eq('trader_id', trader.id)
        .order('pnl', { ascending: false })

      if (positionsError) {
        console.error('Error fetching positions:', positionsError)
        throw positionsError
      }

      return {
        trader,
        positions: positions || []
      }
    } catch (error) {
      console.error('Failed to fetch trader details:', error)
      return null
    }
  }
}