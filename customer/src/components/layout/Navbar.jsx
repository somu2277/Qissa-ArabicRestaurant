import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { Menu, Search, User, Utensils, UtensilsCrossed, MapPin, X } from 'lucide-react';

export const Navbar = ({ onSearchClick }) => {
  const { restaurant, currentTable } = useMenu();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const tableLabel = currentTable?.label ? `Table T-${currentTable.label}` : 'Table T-05';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF6F0] border-b border-[#F2EBE0] shadow-xs transition-all">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Mobile Left: Hamburger Icon (Mobile) / Brand (Desktop) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="sm:hidden p-1.5 -ml-1 text-[#1A1A1A] hover:text-[#E8602C] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Open menu drawer"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Brand Logo */}
            <a href="#home" className="hidden sm:flex items-center gap-3 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E8602C] text-white flex items-center justify-center shadow-md shadow-[#E8602C]/20 group-hover:scale-105 transition-transform">
                <span className="font-arabic text-lg sm:text-xl font-bold">ق</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#1A1A1A]">
                    {restaurant?.name || 'Qissa'}
                  </span>
                  <span className="font-arabic text-sm text-[#C9953C]">قصة</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B655D]">
                  Arabic Restaurant
                </span>
              </div>
            </a>
          </div>

          {/* Mobile Center: Qissa قصة Arabic Restaurant */}
          <div className="sm:hidden flex flex-col items-center text-center">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-lg tracking-tight text-[#1A1A1A]">
                {restaurant?.name || 'Qissa'}
              </span>
              <span className="font-arabic text-sm font-semibold text-[#C9953C]">قصة</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8C8275] -mt-0.5">
              Arabic Restaurant
            </span>
          </div>

          {/* Right Actions: Table & Search & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Table Badge for Desktop */}
            {currentTable && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8602C]/10 border border-[#E8602C]/30 text-[#E8602C] text-xs font-bold tracking-wide">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Table {currentTable.label}</span>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={onSearchClick}
              className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-[#E0D7C9] text-[#6B655D] hover:text-[#1A1A1A] hover:border-[#E8602C] hover:shadow-xs transition-all cursor-pointer"
              aria-label="Search menu"
            >
              <Search className="w-4 h-4 text-[#E8602C]" />
              <span className="hidden md:inline text-xs font-medium ml-2">Search dishes...</span>
            </button>

            {/* Profile / Table Action Icon */}
            <button
              type="button"
              onClick={onSearchClick}
              className="sm:hidden p-1.5 text-[#1A1A1A] hover:text-[#E8602C] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-[#4A453E]" />
            </button>

            <a
              href="#footer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#6B655D] hover:text-[#E8602C] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E8602C]" />
              <span>Find Us</span>
            </a>
          </div>
        </div>

        {/* Mobile Sub-bar: [Table T-05] and [Dine-in Menu] matching Screen 1 */}
        <div className="sm:hidden px-4 pb-2.5 pt-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 bg-white/90 border border-[#E8DFD3] rounded-full px-4 py-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[#E8602C] text-xs font-bold">
              <Utensils className="w-3.5 h-3.5" />
              <span>{tableLabel}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-[#D1C7B8]" />
            <span className="text-[11px] font-medium text-[#6B655D]">
              Dine-in Menu
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#FAF6F0] h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D6] mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#E8602C] text-white flex items-center justify-center font-arabic font-bold text-lg shadow-sm">
                    ق
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                      {restaurant?.name || 'Qissa'}
                    </h3>
                    <p className="text-[10px] text-[#8C8275] uppercase tracking-wider">
                      Arabic Restaurant
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-full text-[#6B655D] hover:text-[#1A1A1A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm font-medium">
                <a
                  href="#home"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-white text-[#1A1A1A] hover:text-[#E8602C] transition-colors"
                >
                  Home & Explore
                </a>
                <a
                  href="#specials-section"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-white text-[#1A1A1A] hover:text-[#E8602C] transition-colors"
                >
                  Today's Specials 🔥
                </a>
                <a
                  href="#explore-categories"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-white text-[#1A1A1A] hover:text-[#E8602C] transition-colors"
                >
                  Explore by Category
                </a>
                <a
                  href="#menu-section"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-white text-[#1A1A1A] hover:text-[#E8602C] transition-colors"
                >
                  Full Menu
                </a>
                <a
                  href="#footer"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-3 py-2.5 rounded-xl hover:bg-white text-[#1A1A1A] hover:text-[#E8602C] transition-colors"
                >
                  Restaurant & Contact Info
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE3D6] text-xs text-[#8C8275] text-center">
              <span>{restaurant?.address || 'Shop 12-14, Gourmet Galleria, Main Boulevard'}</span>
              <p className="mt-1 font-semibold text-[#1A1A1A]">
                {restaurant?.phone || '+91 98765 43210'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
