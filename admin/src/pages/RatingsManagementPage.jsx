import React, { useEffect, useState } from 'react';
import {
  getAdminRatingStats,
  getAdminRatings,
  updateAdminRatingSettings,
} from '../services/adminApi';
import {
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Clock,
  Sparkles,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const RatingsManagementPage = () => {
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const [statsData, ratingsData] = await Promise.all([
        getAdminRatingStats(),
        getAdminRatings(page, 20),
      ]);
      setStats(statsData);
      setRatings(ratingsData.data || []);
      setPagination(ratingsData.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      console.error('Error fetching ratings management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRatings = async () => {
    if (!stats) return;
    const newStatus = !stats.isEnabled;
    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus ? 'enable' : 'pause'
        } customer food ratings across the restaurant?`
      )
    ) {
      return;
    }

    setUpdatingStatus(true);
    try {
      await updateAdminRatingSettings({ isEnabled: newStatus });
      setStats((prev) => ({ ...prev, isEnabled: newStatus }));
    } catch (err) {
      alert('Failed to update ratings settings: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="p-8 text-center text-xs text-[#6B655D]">
        Loading ratings statistics...
      </div>
    );
  }

  const dist = stats?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalVotes = stats?.totalRatings || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Customer Food Ratings Management
          </h1>
          <p className="text-xs text-[#6B655D] mt-1">
            Genuine ratings verified through restaurant dining table QR codes.
          </p>
        </div>

        {/* Global Ratings Enable / Pause Switch */}
        <button
          onClick={handleToggleRatings}
          disabled={updatingStatus}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
            stats?.isEnabled
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {stats?.isEnabled ? (
            <>
              <PauseCircle className="w-4 h-4" />
              <span>Pause Ratings</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Enable Ratings</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ratings */}
        <div className="bg-white p-5 rounded-3xl border border-[#E9ECEF] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655D]">
              Total Customer Ratings
            </span>
            <div className="font-serif text-3xl font-bold text-[#1A1A1A] mt-1">
              {stats?.totalRatings || 0}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
              100% verified table sessions
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E8602C]/10 text-[#E8602C] flex items-center justify-center">
            <Star className="w-6 h-6 fill-[#E8602C]" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-5 rounded-3xl border border-[#E9ECEF] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655D]">
              Overall Food Rating
            </span>
            <div className="font-serif text-3xl font-bold text-[#E8602C] mt-1 flex items-baseline gap-1">
              <span>{stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}</span>
              <span className="text-sm font-sans text-[#6B655D] font-normal">/ 5.0</span>
            </div>
            <span className="text-[10px] text-[#6B655D] mt-0.5 block">Across all menu items</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Rated Dishes */}
        <div className="bg-white p-5 rounded-3xl border border-[#E9ECEF] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655D]">
              Dishes with Ratings
            </span>
            <div className="font-serif text-3xl font-bold text-[#1A1A1A] mt-1">
              {stats?.totalRatedDishes || 0}
            </div>
            <span className="text-[10px] text-[#6B655D] mt-0.5 block">Active menu dishes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        {/* Ratings Status */}
        <div className="bg-white p-5 rounded-3xl border border-[#E9ECEF] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655D]">
              System Status
            </span>
            <div className="font-serif text-xl font-bold text-[#1A1A1A] mt-1 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  stats?.isEnabled ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{stats?.isEnabled ? 'Active' : 'Paused'}</span>
            </div>
            <span className="text-[10px] text-[#6B655D] mt-0.5 block">
              {stats?.isEnabled ? 'Accepting table ratings' : 'Submissions temporarily paused'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Star Distribution & Highest/Lowest Rated */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Star Rating Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9ECEF] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Star Rating Distribution</h3>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = dist[stars] || 0;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-[#1A1A1A] flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-[#E8602C] text-[#E8602C]" />
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-[#FAF6F0] overflow-hidden border border-[#F2EBE0]">
                    <div
                      className="h-full bg-[#E8602C] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-[#6B655D] font-medium">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highest Rated Dishes */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9ECEF] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Highest-Rated Dishes</h3>
          </div>
          {stats?.highestRated && stats.highestRated.length > 0 ? (
            <div className="space-y-3">
              {stats.highestRated.map((dish) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2EBE0]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={dish.primaryImage}
                      alt={dish.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-[#1A1A1A] truncate">{dish.name}</h4>
                      <span className="text-[10px] text-[#6B655D]">₹{dish.price}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif font-bold text-xs text-[#E8602C] flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3 fill-[#E8602C]" />
                      <span>{dish.averageRating.toFixed(1)}</span>
                    </span>
                    <span className="text-[10px] text-[#6B655D]">({dish.totalRatings})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B655D] italic">No ratings recorded yet.</p>
          )}
        </div>

        {/* Lowest Rated Dishes */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9ECEF] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Attention Needed</h3>
          </div>
          {stats?.lowestRated && stats.lowestRated.length > 0 ? (
            <div className="space-y-3">
              {stats.lowestRated.map((dish) => (
                <div
                  key={dish._id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#F2EBE0]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={dish.primaryImage}
                      alt={dish.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-[#1A1A1A] truncate">{dish.name}</h4>
                      <span className="text-[10px] text-[#6B655D]">₹{dish.price}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif font-bold text-xs text-rose-600 flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3 fill-rose-600" />
                      <span>{dish.averageRating.toFixed(1)}</span>
                    </span>
                    <span className="text-[10px] text-[#6B655D]">({dish.totalRatings})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B655D] italic">No ratings recorded yet.</p>
          )}
        </div>
      </div>

      {/* Recent Customer Ratings Feed */}
      <div className="bg-white rounded-3xl border border-[#E9ECEF] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E9ECEF] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
              Recent Verified Customer Submissions
            </h3>
            <p className="text-xs text-[#6B655D] mt-0.5">
              Live audit stream of ratings from dining table sessions
            </p>
          </div>
          <span className="text-xs text-[#6B655D] font-medium">
            Showing {ratings.length} of {pagination.total} submissions
          </span>
        </div>

        {ratings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[#6B655D] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Dish</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Table</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {ratings.map((r) => (
                  <tr key={r._id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.menuItemId?.primaryImage || 'https://via.placeholder.com/80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <span className="font-bold text-[#1A1A1A] block">
                            {r.menuItemId?.name || 'Deleted Dish'}
                          </span>
                          <span className="text-[11px] text-[#6B655D]">
                            ₹{r.menuItemId?.price}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[#E8602C] font-bold">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            className={`w-3.5 h-3.5 ${
                              st <= r.rating
                                ? 'fill-[#E8602C] text-[#E8602C]'
                                : 'fill-transparent text-[#E0D7C9]'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs">{r.rating}★</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {r.tableId ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E0D7C9] text-[11px] font-bold text-[#1A1A1A]">
                          <span>Table {r.tableId.label}</span>
                          <span className="text-[#6B655D] font-normal">
                            ({r.tableId.location})
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#6B655D]">—</span>
                      )}
                    </td>
                    <td className="p-4 text-[#6B655D]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#6B655D]">
            No ratings have been submitted yet. When customers rate dishes at their tables, they will appear here live.
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-[#E9ECEF] flex items-center justify-between text-xs">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchData(pagination.page - 1)}
              className="px-3 py-1.5 rounded-xl border border-[#E9ECEF] disabled:opacity-40 flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-[#6B655D]">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchData(pagination.page + 1)}
              className="px-3 py-1.5 rounded-xl border border-[#E9ECEF] disabled:opacity-40 flex items-center gap-1 font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
