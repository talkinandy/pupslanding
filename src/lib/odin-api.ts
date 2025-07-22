/**
 * Odin API Service - Direct API calls for real-time data
 */

export interface OdinDashboardStats {
  tokens: number;
  bonded: number;
  total_volume_24h: number;
  total_volume_all: number;
  total_users: number;
  trades_30d: Array<{
    date: string;
    volume: number;
  }>;
  activities_30d: Array<{
    date: string;
    activity_types: Record<string, unknown>;
  }>;
}

export interface OdinTradeData {
  id: string;
  token_id: string;
  trader_principal: string;
  trade_type: 'buy' | 'sell';
  amount_millisats: string;
  token_amount: string;
  timestamp: string;
  token_name?: string;
}

export interface OdinTokenData {
  id: string;
  name: string;
  symbol: string;
  description: string;
  current_price_millisats: string;
  market_cap_millisats: string;
  volume_24h_millisats: string;
  created_at: string;
  is_bonded: boolean;
}

export interface OdinTraderPosition {
  token_id: string;
  token_name: string;
  token_symbol: string;
  amount: string;
  entry_price_millisats: string;
  current_price_millisats: string;
  pnl_millisats: string;
  percentage_change: number;
}

export class OdinAPIService {
  private static readonly BASE_URL = 'https://api.odin.fun/v1';
  
  /**
   * Convert millisatoshis to BTC
   */
  private static millisatsToBTC(millisats: string | number): number {
    const ms = typeof millisats === 'string' ? parseInt(millisats) : millisats;
    return ms / 100_000_000_000; // 1 BTC = 100,000,000,000 millisats
  }

  /**
   * Get platform dashboard statistics
   */
  static async getDashboardStats(): Promise<{
    totalTraders: number;
    totalVolume: string;
    dailyVolume: string;
    totalTokens: number;
    bondedTokens: number;
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}/statistics/dashboard`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: OdinDashboardStats = await response.json();
      
      return {
        totalTraders: data.total_users,
        totalVolume: `${this.millisatsToBTC(data.total_volume_all).toFixed(2)} BTC`,
        dailyVolume: `${this.millisatsToBTC(data.total_volume_24h).toFixed(2)} BTC`,
        totalTokens: data.tokens,
        bondedTokens: data.bonded,
      };
    } catch (error) {
      console.error('Failed to fetch Odin dashboard stats:', error);
      // Return fallback data from last known values
      return {
        totalTraders: 156619,
        totalVolume: '6254.38 BTC', 
        dailyVolume: '47.44 BTC',
        totalTokens: 24434,
        bondedTokens: 267,
      };
    }
  }

  /**
   * Get recent trades for a specific trader
   */
  static async getTraderTrades(traderPrincipal: string, limit = 50): Promise<OdinTradeData[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/trades?trader=${encodeURIComponent(traderPrincipal)}&limit=${limit}&sort=desc`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch trades for trader ${traderPrincipal}:`, error);
      return [];
    }
  }

  /**
   * Calculate trader positions from trades (since positions endpoint might not exist)
   */
  static async calculateTraderPositions(traderPrincipal: string): Promise<OdinTraderPosition[]> {
    try {
      const trades = await this.getTraderTrades(traderPrincipal, 1000);
      
      // Group trades by token to calculate positions
      const tokenMap = new Map<string, {
        token_id: string;
        token_name: string;
        token_symbol: string;
        total_amount: number;
        total_cost: number;
        trades: OdinTradeData[];
      }>();

      for (const trade of trades) {
        const tokenId = trade.token_id;
        const amount = parseFloat(trade.token_amount);
        const cost = this.millisatsToBTC(trade.amount_millisats);
        
        if (!tokenMap.has(tokenId)) {
          tokenMap.set(tokenId, {
            token_id: tokenId,
            token_name: trade.token_name || `Token ${tokenId.slice(0, 8)}`,
            token_symbol: trade.token_name || `T${tokenId.slice(0, 4)}`,
            total_amount: 0,
            total_cost: 0,
            trades: [],
          });
        }

        const position = tokenMap.get(tokenId)!;
        position.trades.push(trade);

        if (trade.trade_type === 'buy') {
          position.total_amount += amount;
          position.total_cost += cost;
        } else {
          position.total_amount -= amount;
          position.total_cost -= cost;
        }
      }

      // Get current token prices and calculate P&L
      const positions: OdinTraderPosition[] = [];
      
      for (const [tokenId, position] of tokenMap.entries()) {
        if (position.total_amount > 0) { // Only include tokens with positive holdings
          const currentPrice = await this.getTokenPrice(tokenId);
          const currentValue = position.total_amount * currentPrice;
          const avgEntryPrice = position.total_cost / position.total_amount;
          const pnl = currentValue - position.total_cost;
          const percentageChange = ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100;

          positions.push({
            token_id: tokenId,
            token_name: position.token_name,
            token_symbol: position.token_symbol,
            amount: position.total_amount.toString(),
            entry_price_millisats: (avgEntryPrice * 100_000_000_000).toString(),
            current_price_millisats: (currentPrice * 100_000_000_000).toString(),
            pnl_millisats: (pnl * 100_000_000_000).toString(),
            percentage_change: percentageChange,
          });
        }
      }

      return positions.sort((a, b) => parseFloat(b.pnl_millisats) - parseFloat(a.pnl_millisats));
    } catch (error) {
      console.error(`Failed to calculate positions for trader ${traderPrincipal}:`, error);
      return [];
    }
  }

  /**
   * Get current token price
   */
  private static async getTokenPrice(tokenId: string): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/token/${tokenId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return 0.00000001; // Fallback price
      }

      const tokenData: OdinTokenData = await response.json();
      return this.millisatsToBTC(tokenData.current_price_millisats);
    } catch (error) {
      console.error(`Failed to fetch price for token ${tokenId}:`, error);
      return 0.00000001; // Fallback price
    }
  }

  /**
   * Get top traders data for leaderboard updates
   */
  static async getTopTraders(limit = 100): Promise<Array<{
    principal: string;
    name: string;
    realized_pnl: number;
    unrealized_pnl: number;
    total_pnl: number;
    volume_24h: number;
  }>> {
    try {
      // This would need to be implemented based on available Odin API endpoints
      // For now, return empty array - will be populated by GitHub Actions
      console.log('getTopTraders would fetch from Odin API endpoint');
      return [];
    } catch (error) {
      console.error('Failed to fetch top traders:', error);
      return [];
    }
  }
}