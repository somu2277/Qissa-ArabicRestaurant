import React from 'react';
import { useMenu } from '../../context/MenuContext';
import { Utensils, Clock, Phone, MapPin } from 'lucide-react';

export const TableBanner = () => {
  const { restaurant, currentTable } = useMenu();

  return (
    <section className="bg-white border-b border-[#F2EBE0] py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Table Welcome / Status */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#E8602C]/10 border border-[#E8602C]/20 flex items-center justify-center shrink-0">
            <Utensils className="w-7 h-7 text-[#E8602C]" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A1A1A]">
              Welcome to {restaurant?.name || 'Qissa Arabic Restaurant'}
            </h2>
            {currentTable ? (
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-0.5 rounded-full bg-[#E8602C] text-white text-xs font-bold tracking-wider uppercase">
                <span>Your Table: {currentTable.label}</span>
                <span className="text-white/60">•</span>
                <span className="text-white/90 capitalize">{currentTable.location}</span>
              </div>
            ) : (
              <p className="text-xs text-[#6B655D] mt-0.5">
                Browse our digital menu on your phone and place your order directly with your waiter.
              </p>
            )}
          </div>
        </div>

        {/* Restaurant Quick Verified Info */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-xs text-[#6B655D]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9953C]" />
            <span>{restaurant?.openingHours || '12:00 PM – 11:30 PM'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#C9953C]" />
            <a href={`tel:${restaurant?.phone}`} className="hover:text-[#E8602C] transition-colors">
              {restaurant?.phone || '+91 98765 43210'}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C9953C]" />
            <span className="max-w-[200px] truncate">{restaurant?.address || 'Gourmet Galleria'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
