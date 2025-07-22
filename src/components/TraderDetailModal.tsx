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
      // Fetch live data directly from Odin API
      const odinPositions = await OdinAPIService.calculateTraderPositions(trader.principal);
      
      // Convert to our interface format
      const convertedPositions: TraderPosition[] = odinPositions.map((pos, index) => ({
        id: `${pos.token_id}-${index}`,
        token_name: pos.token_name,
        amount: parseFloat(pos.amount),
        entry_price: parseInt(pos.entry_price_millisats) / 100_000_000_000, // Convert millisats to BTC
        current_price: parseInt(pos.current_price_millisats) / 100_000_000_000, // Convert millisats to BTC
        pnl: parseInt(pos.pnl_millisats) / 100_000_000_000, // Convert millisats to BTC
        percentage_change: pos.percentage_change
      }));
      
      setPositions(convertedPositions);
    } catch (err) {
      console.error('Error loading trader details:', err);
      setError('Failed to fetch live holdings data from Odin API');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPortfolioValue = positions.reduce((sum, pos) => sum + (pos.current_price * pos.amount), 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

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
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const formatPrice = (price: number) => {
    return price.toFixed(8);
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
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
                    <p className="text-gray-400 text-sm mb-1">Positions</p>
                    <p className="text-white font-mono text-lg">{positions.length}</p>
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">
                              {position.token_name}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Amount: <span className="font-mono">{formatTokenAmount(position.amount)}</span>
                            </p>
                          </div>
                          
                          <div className="flex-shrink-0 text-right">
                            <div className="text-white font-mono text-sm mb-1">
                              {formatPrice(position.current_price)} BTC
                            </div>
                            <div className="text-xs">
                              {formatBTC(position.pnl)}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 text-right">
                            <div className="text-white font-mono text-sm">
                              {(position.current_price * position.amount).toFixed(8)} BTC
                            </div>
                            <div className="text-gray-400 text-xs">
                              Value
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