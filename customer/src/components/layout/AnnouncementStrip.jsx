import React from 'react';
import { useMenu } from '../../context/MenuContext';
import { Sparkles } from 'lucide-react';

export const AnnouncementStrip = () => {
  const { restaurant } = useMenu();

  if (!restaurant?.announcement?.isActive || !restaurant?.announcement?.text) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#D14E1E] via-[#E8602C] to-[#C9953C] text-white py-2 px-4 text-xs md:text-sm font-medium shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
        <span className="tracking-wide">{restaurant.announcement.text}</span>
      </div>
    </div>
  );
};
