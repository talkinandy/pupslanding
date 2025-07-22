'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import TraderDetailModal from '@/components/TraderDetailModal';
import { ChevronUp, TrendingUp, Users, Activity, Trophy, Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatabaseService } from '@/lib/database';
import { OdinAPIService } from '@/lib/odin-api';
import type { DashboardTrader, DashboardStats } from '@/types/database';

// Convert database types to component interface for compatibility
interface Trader {
  rank: number;
  principal: string;
  name: string;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
}

// Helper function to convert DashboardTrader to Trader
const convertToTrader = (dbTrader: DashboardTrader): Trader => ({
  rank: dbTrader.rank,
  principal: dbTrader.principal,
  name: dbTrader.name,
  realizedPnl: Number(dbTrader.realized_pnl),
  unrealizedPnl: Number(dbTrader.unrealized_pnl),
  totalPnl: Number(dbTrader.total_pnl)
});

const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [filteredTraders, setFilteredTraders] = useState<Trader[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveStats, setLiveStats] = useState<{
    totalTraders: number;
    totalVolume: string;
    dailyVolume: string;
    totalTokens: number;
    bondedTokens: number;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState<DashboardTrader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter traders based on search
  useEffect(() => {
    const filtered = traders.filter(trader =>
      trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trader.principal.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTraders(filtered);
  }, [searchQuery, traders]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load traders from Supabase and live stats from Odin API in parallel
      const [leaderboardData, statsData, liveStatsData] = await Promise.all([
        DatabaseService.getLeaderboard(100),
        DatabaseService.getPlatformStats(), // Fallback stats from DB
        OdinAPIService.getDashboardStats()  // Live stats from Odin API
      ]);

      const convertedTraders = leaderboardData.map(convertToTrader);
      setTraders(convertedTraders);
      setFilteredTraders(convertedTraders);
      setStats(statsData);
      setLiveStats(liveStatsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Keep empty state on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh leaderboard and reload data
      await DatabaseService.refreshLeaderboard();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTraderClick = (trader: Trader) => {
    // Convert Trader to DashboardTrader format for the modal
    const dashboardTrader: DashboardTrader = {
      principal: trader.principal,
      name: trader.name,
      realized_pnl: trader.realizedPnl,
      unrealized_pnl: trader.unrealizedPnl,
      total_pnl: trader.totalPnl,
      rank: trader.rank,
      snapshot_date: new Date().toISOString().split('T')[0]
    };
    setSelectedTrader(dashboardTrader);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrader(null);
  };

  const formatBTC = (value: number) => {
    const sign = value >= 0 ? '▲' : '▼';
    const color = value >= 0 ? 'text-[#24a936]' : 'text-red-500';
    return (
      <span className={`${color} font-mono`}>
        {sign} {Math.abs(value).toFixed(8)} BTC
      </span>
    );
  };

  const displayStats = {
    totalTraders: liveStats?.totalTraders || stats?.totalTraders || 0,
    totalVolume: liveStats?.dailyVolume || stats?.totalVolume || '0.00 BTC',
    topGainer: stats?.topGainer || null,
    activeNow: Math.floor((liveStats?.totalTraders || stats?.totalTraders || 0) * 0.1) // Estimate 10% active
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D]">
      <Header />
      
      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section with Stats */}
        <section className="relative bg-gradient-to-br from-[#0574f9] via-[#0574f9] to-[#0462d4] py-16 px-4 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-dion text-white mb-4">
                Odin Dashboard
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Track the top traders and their performance on Odin.fun. Monitor holdings and profits in real-time.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-white" />
                  <span className="text-white/80 text-sm">Total Traders</span>
                </div>
                <p className="text-3xl font-bold text-white">{displayStats.totalTraders.toLocaleString()}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-white" />
                  <span className="text-white/80 text-sm">24h Volume</span>
                </div>
                <p className="text-3xl font-bold text-white">{displayStats.totalVolume}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-8 w-8 text-white" />
                  <span className="text-white/80 text-sm">Top Trader</span>
                </div>
                <p className="text-lg font-bold text-white truncate">{displayStats.topGainer?.name || 'Loading...'}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-8 w-8 text-white" />
                  <span className="text-white/80 text-sm">Active Now</span>
                </div>
                <p className="text-3xl font-bold text-white">{displayStats.activeNow}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Controls & Table */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              {/* Time Period Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="flex gap-2">
                  {['24h', '7d', '30d', 'all'].map((period) => (
                    <Button
                      key={period}
                      onClick={() => setActiveFilter(period as '24h' | '7d' | '30d' | 'all')}
                      variant={activeFilter === period ? "default" : "outline"}
                      className={`${
                        activeFilter === period
                          ? 'bg-[#0574f9] text-white hover:bg-[#0462d4]'
                          : 'bg-transparent border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      {period.toUpperCase()}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      placeholder="Search traders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-[#0574f9] sm:w-80"
                    />
                  </div>

                  {/* Refresh Button */}
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Table Header Info */}
              <div className="text-white/70 text-sm mb-4">
                Showing top {filteredTraders.length} traders • Data updated every hour
              </div>
            </motion.div>

            {/* Leaderboard Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 border-b border-white/10 text-white/80 text-sm font-semibold">
                <div>Rank</div>
                <div>Trader</div>
                <div className="text-right">Realized</div>
                <div className="text-right">Unrealized</div>
              </div>

              {/* Table Body */}
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-16">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 text-white/50 animate-spin mx-auto mb-4" />
                      <p className="text-white/70">Loading traders data...</p>
                    </div>
                  </div>
                ) : filteredTraders.length === 0 ? (
                  <div className="flex items-center justify-center p-16">
                    <div className="text-center">
                      <Users className="h-8 w-8 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70">No traders found</p>
                      {searchQuery && <p className="text-white/50 text-sm mt-2">Try adjusting your search</p>}
                    </div>
                  </div>
                ) : (
                  filteredTraders.slice(0, 50).map((trader, index) => (
                  <motion.div
                    key={trader.principal}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="grid grid-cols-4 gap-4 p-4 border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleTraderClick(trader)}
                  >
                    {/* Rank */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        trader.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        trader.rank === 2 ? 'bg-gray-500/20 text-gray-300' :
                        trader.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/10 text-white/80'
                      }`}>
                        {trader.rank}
                      </div>
                    </div>

                    {/* Trader Name */}
                    <div className="flex items-center">
                      <div>
                        <div className="text-white font-medium truncate max-w-[200px]">
                          {trader.name}
                        </div>
                        <div className="text-white/50 text-xs font-mono truncate">
                          {trader.principal}
                        </div>
                      </div>
                    </div>

                    {/* Realized P&L */}
                    <div className="text-right flex items-center justify-end">
                      {formatBTC(trader.realizedPnl)}
                    </div>

                    {/* Unrealized P&L */}
                    <div className="text-right flex items-center justify-end">
                      {formatBTC(trader.unrealizedPnl)}
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Load More */}
            {filteredTraders.length > 50 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Load More Traders
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Thor Attribution Footer */}
        <section className="py-8 px-4 bg-white/5 border-t border-white/10">
          <div className="container mx-auto text-center">
            <p className="text-white/70 text-sm">
              Data provided by{' '}
              <a
                href="https://odinsson.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0574f9] hover:text-[#0574f9]/80 transition-colors font-medium"
              >
                Thor Odinsson
              </a>
            </p>
          </div>
        </section>
      </main>
      
      {/* Trader Detail Modal */}
      <TraderDetailModal 
        trader={selectedTrader}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DashboardPage;