import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  QrCode,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Star,
} from 'lucide-react';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/menu', label: 'Menu Items', icon: UtensilsCrossed },
    { to: '/categories', label: 'Categories', icon: FolderTree },
    { to: '/tables', label: 'Tables & QR Codes', icon: QrCode },
    { to: '/specials', label: "Today's Specials", icon: Sparkles },
    { to: '/ratings', label: 'Customer Ratings', icon: Star },
    { to: '/settings', label: 'Restaurant Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E9ECEF] shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8602C] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#E8602C]/20">
              Q
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-[#1A1A1A] leading-tight">
                Qissa Admin
              </h1>
              <span className="text-[11px] text-[#6B655D] font-medium">Management Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E8602C] text-white shadow-md shadow-[#E8602C]/20'
                      : 'text-[#6B655D] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Customer Link / Admin Profile */}
        <div className="p-4 border-t border-[#E9ECEF] space-y-3">
          <a
            href={import.meta.env.VITE_PUBLIC_MENU_URL || 'https://qissa-arabic-restaurant.vercel.app'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0] hover:bg-[#F2EBE0] text-[#E8602C] text-xs font-semibold border border-[#E0D7C9] transition-colors"
          >
            <span>Live Customer Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {admin?.username?.[0] || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#1A1A1A] truncate">{admin?.username}</p>
                <span className="text-[10px] text-[#6B655D] capitalize">{admin?.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#6B655D] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#1A1A1A] hover:bg-[#F8F9FA] rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B655D] hidden sm:inline">Signed in as:</span>
            <span className="text-xs font-bold text-[#1A1A1A]">{admin?.email}</span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E9ECEF] p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold ${
                      isActive
                        ? 'bg-[#E8602C] text-white shadow-sm'
                        : 'text-[#6B655D] hover:bg-[#F8F9FA]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
