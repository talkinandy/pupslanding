'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { OdinAPIService, type OdinTraderPosition } from '@/lib/odin-api';
import type { DashboardTrader } from '@/types/database';

interface TraderPosition {
  id: string;
  token_name: string;
  amount: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  percentage_change: number;
  price_change_1h: number;
  price_change_24h: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl: number;
  avg_buy_price: number;
  realized_quantity: number;
}

interface TraderDetailModalProps {
  trader: DashboardTrader | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TraderDetailModal({ trader, isOpen, onClose }: TraderDetailModalProps) {
  const [positions, setPositions] = useState<TraderPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && trader) {
      loadTraderDetails();
    }
  }, [isOpen, trader]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTraderDetails = async () => {
    if (!trader) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Get user balances
      const balancesResponse = await fetch(`https://api.odin.fun/v1/user/${trader.principal}/balances?limit=20`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PUPS-Dashboard/1.0'
        }
      });
      
      if (!balancesResponse.ok) {
        throw new Error(`API request failed: ${balancesResponse.status}`);
      }
      
      const balancesData = await balancesResponse.json();
      console.log('Balances data:', balancesData);
      
      // Filter out zero balances and BTC
      const tokenBalances = balancesData.data.filter(
        (balance: { balance: number; id: string }) => balance.balance > 0 && balance.id !== 'btc'
      );
      
      if (tokenBalances.length === 0) {
        setPositions([]);
        setError('This trader currently has no token holdings');
        return;
      }
      
      // Fetch real token prices and P&L data for each held token
      const positionsPromises = tokenBalances.map(async (balance: { 
        id: string; 
        name?: string; 
        ticker?: string; 
        balance: number; 
        divisibility?: number 
      }) => {
        // Convert raw balance to actual token amount
        // Total supply is 21M tokens (2100000000000000000 / 10^11 = 21,000,000)
        // The divisibility field in API is 8 but actual conversion needs 10^11
        const actualTokenAmount = balance.balance / Math.pow(10, 11);
        
        try {
          // Fetch token price, realized P&L, and unrealized P&L in parallel
          const [tokenResponse, realizedResponse, unrealizedResponse] = await Promise.all([
            fetch(`https://api.odin.fun/v1/token/${balance.id}`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PUPS-Dashboard/1.0'
              }
            }),
            fetch(`https://api.odin.fun/v1/user/${trader.principal}/token/${balance.id}/realized_pnl`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PUPS-Dashboard/1.0'
              }
            }),
            fetch(`https://api.odin.fun/v1/user/${trader.principal}/token/${balance.id}/unrealized_pnl`, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PUPS-Dashboard/1.0'
              }
            })
          ]);
          
          if (!tokenResponse.ok) {
            console.warn(`Failed to get price for token ${balance.id}, skipping due to no price data`);
            return null; // Skip tokens without price data
          }
          
          const tokenData = await tokenResponse.json();
          console.log(`Token ${balance.id} data:`, tokenData);
          
          // Parse P&L data (may fail if user has no trading history)
          let realizedData = null;
          let unrealizedData = null;
          
          try {
            if (realizedResponse.ok) {
              realizedData = await realizedResponse.json();
            }
          } catch (e) {
            console.log(`No realized P&L data for token ${balance.id}`);
          }
          
          try {
            if (unrealizedResponse.ok) {
              unrealizedData = await unrealizedResponse.json();
            }
          } catch (e) {
            console.log(`No unrealized P&L data for token ${balance.id}`);
          }
          
          // Convert token price from millisatoshis to BTC
          const currentPriceBTC = tokenData.price / 100_000_000_000; // Convert millisats to BTC
          
          // Calculate historical price changes
          const price1hBTC = tokenData.price_1h ? tokenData.price_1h / 100_000_000_000 : currentPriceBTC;
          const price24hBTC = tokenData.price_1d ? tokenData.price_1d / 100_000_000_000 : currentPriceBTC;
          
          const priceChange1h = ((currentPriceBTC - price1hBTC) / price1hBTC) * 100;
          const priceChange24h = ((currentPriceBTC - price24hBTC) / price24hBTC) * 100;
          
          // Use real P&L data if available, otherwise skip the token
          let realizedPnL = 0;
          let unrealizedPnL = 0;
          let avgBuyPrice = 0;
          let realizedQuantity = 0;
          
          if (realizedData?.data) {
            // Use the raw realized_pnl and convert properly
            const rawRealizedPnL = realizedData.data.realized_pnl || 0;
            realizedPnL = rawRealizedPnL / 100_000_000_000; // Convert millisats to BTC
            realizedQuantity = realizedData.data.display_realized_quantity || 0;
          }
          
          if (unrealizedData?.data) {
            // Calculate manual unrealized P&L to avoid API scaling issues
            const holdings = unrealizedData.data.display_unrealized_quantity || 0;
            const avgBuyPriceMillisats = unrealizedData.data.avg_buy_price || 0;
            avgBuyPrice = avgBuyPriceMillisats / 100_000_000_000; // Convert from millisats to BTC
            
            // Manual calculation: (current_price - avg_buy_price) * holdings
            const currentValueBTC = holdings * currentPriceBTC;
            const costBasisBTC = holdings * avgBuyPrice;
            unrealizedPnL = currentValueBTC - costBasisBTC;
          }
          
          // Skip tokens with no P&L data (likely dust or inactive positions)
          if (realizedPnL === 0 && unrealizedPnL === 0 && avgBuyPrice === 0) {
            console.log(`Skipping token ${balance.id} - no P&L data available`);
            return null;
          }
          
          // Filter out dust positions (very low value)
          const currentValue = actualTokenAmount * currentPriceBTC;
          const MIN_VALUE_THRESHOLD = 0.00000100; // 100 satoshis minimum
          
          if (currentValue < MIN_VALUE_THRESHOLD) {
            console.log(`Skipping token ${balance.id} - dust value: ${currentValue.toFixed(8)} BTC`);
            return null;
          }
          
          const totalPnL = realizedPnL + unrealizedPnL;
          const pnl = totalPnL; // Use real total P&L
          const percentageChange = avgBuyPrice > 0 ? ((currentPriceBTC - avgBuyPrice) / avgBuyPrice) * 100 : 0;
          
          return {
            id: balance.id,
            token_name: tokenData.name || tokenData.ticker || balance.id,
            amount: actualTokenAmount,
            entry_price: avgBuyPrice,
            current_price: currentPriceBTC,
            pnl: pnl,
            percentage_change: percentageChange,
            price_change_1h: priceChange1h,
            price_change_24h: priceChange24h,
            realized_pnl: realizedPnL,
            unrealized_pnl: unrealizedPnL,
            total_pnl: totalPnL,
            avg_buy_price: avgBuyPrice,
            realized_quantity: realizedQuantity
          };
          
        } catch (tokenError) {
          console.error(`Error fetching token ${balance.id}:`, tokenError);
          // Return null for failed tokens
          return null;
        }
      });
      
      // Wait for all token price requests to complete
      const positionsResults = await Promise.all(positionsPromises);
      
      // Filter out failed requests and sort by value (descending)
      const validPositions = positionsResults
        .filter((pos): pos is TraderPosition => pos !== null)
        .sort((a, b) => (b.current_price * b.amount) - (a.current_price * a.amount));
      
      setPositions(validPositions);
      
      // If no valid positions found after filtering, show appropriate message
      if (validPositions.length === 0) {
        if (tokenBalances.length > 0) {
          setError('This trader has no significant token positions with P&L data');
        } else {
          setError('This trader currently has no token holdings');
        }
      }
    } catch (err) {
      console.error('Error loading trader details:', err);
      setError('Failed to fetch trader balance data from Odin API');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPortfolioValue = positions.reduce((sum, pos) => sum + (pos.current_price * pos.amount), 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.total_pnl, 0);
  const totalRealizedPnL = positions.reduce((sum, pos) => sum + pos.realized_pnl, 0);
  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealized_pnl, 0);

  const formatBTC = (value: number) => {
    const sign = value >= 0 ? '▲' : '▼';
    const color = value >= 0 ? 'text-[#24a936]' : 'text-red-500';
    return (
      <span className={`${color} font-mono flex items-center gap-1`}>
        {value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {sign} {Math.abs(value).toFixed(8)} BTC
      </span>
    );
  };

  const formatTokenAmount = (amount: number) => {
    // With 21M supply, holdings are typically in thousands
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`;
    } else if (amount >= 1) {
      return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else {
      return amount.toFixed(4); // For fractional tokens
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(8);
  };

  const formatPriceChange = (change: number, timeframe: string) => {
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? 'text-[#24a936]' : 'text-red-500';
    const icon = change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    
    return (
      <span className={`${color} text-xs font-mono flex items-center gap-1`}>
        {icon}
        {sign}{Math.abs(change).toFixed(2)}% ({timeframe})
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && trader && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-gray-900 rounded-lg shadow-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gray-900 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {trader.name}'s Portfolio
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Portfolio Value</p>
                    <p className="text-white font-mono text-lg">
                      {totalPortfolioValue.toFixed(8)} BTC
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Total P&L</p>
                    <div className="text-lg">
                      {formatBTC(totalPnL)}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Realized P&L</p>
                    <div className="text-lg">
                      {formatBTC(totalRealizedPnL)}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Unrealized P&L</p>
                    <div className="text-lg">
                      {formatBTC(totalUnrealizedPnL)}
                    </div>
                  </div>
                </div>

                <div className="text-gray-400 text-xs">
                  Principal: <span className="font-mono">{trader.principal}</span>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-2 border-[#0574f9] border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading live portfolio from Odin API...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-red-400 text-center">{error}</p>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-400 text-center">No positions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold mb-4">Holdings</h3>
                    {positions.map((position) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="space-y-3">
                          {/* Token header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">
                                {position.token_name}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                Amount: <span className="font-mono">{formatTokenAmount(position.amount)}</span>
                                {position.realized_quantity > 0 && (
                                  <span className="ml-2 text-xs">
                                    (Sold: {formatTokenAmount(position.realized_quantity)})
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-mono text-sm">
                                {(position.current_price * position.amount).toFixed(8)} BTC
                              </div>
                              <div className="text-gray-400 text-xs">
                                Current Value
                              </div>
                            </div>
                          </div>

                          {/* Price and changes */}
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-gray-400 text-xs">Entry → Current</div>
                              <div className="text-white font-mono text-sm">
                                {formatPrice(position.avg_buy_price)} → {formatPrice(position.current_price)} BTC
                              </div>
                            </div>
                            <div className="space-y-0.5 text-right">
                              {formatPriceChange(position.price_change_1h, '1h')}
                              {formatPriceChange(position.price_change_24h, '24h')}
                            </div>
                          </div>

                          {/* P&L breakdown */}
                          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
                            <div className="text-center">
                              <div className="text-gray-400 text-xs mb-1">Realized</div>
                              <div className="text-sm">
                                {formatBTC(position.realized_pnl)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-400 text-xs mb-1">Unrealized</div>
                              <div className="text-sm">
                                {formatBTC(position.unrealized_pnl)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-400 text-xs mb-1">Total P&L</div>
                              <div className="text-sm font-semibold">
                                {formatBTC(position.total_pnl)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-800/50 px-6 py-4">
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}