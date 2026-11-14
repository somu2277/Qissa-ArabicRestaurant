import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/adminApi';
import {
  UtensilsCrossed,
  FolderTree,
  QrCode,
  Sparkles,
  AlertCircle,
  Bot,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#E8602C] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#6B655D]">Loading restaurant analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Menu Items',
      value: stats?.totalItems || 0,
      sub: `${stats?.activeItems || 0} active in menu`,
      icon: UtensilsCrossed,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: 'Unavailable Items',
      value: stats?.unavailableItems || 0,
      sub: 'Currently out of stock',
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      label: 'Categories',
      value: stats?.totalCategories || 0,
      sub: 'Organized food sections',
      icon: FolderTree,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      label: 'Active Table QRs',
      value: stats?.activeTables || 0,
      sub: 'Dining tables mapped',
      icon: QrCode,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      label: "Today's Specials",
      value: stats?.activeSpecials || 0,
      sub: 'Featured promotions',
      icon: Sparkles,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      label: 'Food Assistant',
      value: stats?.chatbotEnabled ? 'Enabled' : 'Disabled',
      sub: 'AI Chatbot recommendation engine',
      icon: Bot,
      color: 'bg-orange-50 text-[#E8602C] border-orange-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
          Dashboard Overview
        </h1>
        <p className="text-xs text-[#6B655D] mt-1">
          Real-time snapshot of your digital menu, tables, and guest interactions.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-[#E9ECEF] shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655D] block mb-1">
                  {card.label}
                </span>
                <span className="font-serif text-3xl font-bold text-[#1A1A1A]">
                  {card.value}
                </span>
                <p className="text-[11px] text-[#6B655D] mt-1">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9ECEF] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#E8602C]" />
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Recent Activity</h2>
          </div>
          <span className="text-xs text-[#6B655D]">Live audit trail</span>
        </div>

        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-[#F1F3F5]">
            {stats.recentActivity.map((log) => (
              <div key={log._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#E8602C]" />
                  <div>
                    <span className="font-bold text-[#1A1A1A]">{log.action}</span>
                    <span className="text-[#6B655D] ml-2 font-mono">[{log.targetType}]</span>
                    {log.details?.name && (
                      <span className="text-[#1A1A1A] ml-2 font-medium">"{log.details.name}"</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-[#6B655D] whitespace-nowrap">
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6B655D] py-4">No recent activity logged yet.</p>
        )}
      </div>
    </div>
  );
};
