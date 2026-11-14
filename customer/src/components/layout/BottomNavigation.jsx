import React from 'react';
import { useMenu } from '../../context/MenuContext';
import { Home, Sparkles, Bot, Star } from 'lucide-react';

export const BottomNavigation = ({ activeTab, onTabChange, onOpenAssistant, onOpenRatings }) => {
  const { selectCategory, categories } = useMenu();

  const handleMenuClick = () => {
    onTabChange('menu');
    const target = document.getElementById('explore-categories') || document.getElementById('menu-section');
    if (target) {
      const navOffset = 125;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
    }
  };

  const handleSpecialsClick = () => {
    onTabChange('specials');
    const target = document.getElementById('specials-section');
    if (target) {
      const navOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
    }
  };

  const handleAssistantClick = () => {
    onTabChange('assistant');
    if (onOpenAssistant) {
      onOpenAssistant();
    }
  };

  const handleRatingsClick = () => {
    onTabChange('ratings');
    if (onOpenRatings) {
      onOpenRatings();
    } else {
      const target = document.getElementById('menu-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#EAE3D6] shadow-lg px-3 py-2 flex items-center justify-around transition-all">
      {/* 1. Menu Tab */}
      <button
        type="button"
        onClick={handleMenuClick}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'menu'
            ? 'text-[#E8602C]'
            : 'text-[#8C8275] hover:text-[#1A1A1A]'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'menu' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className="text-[11px] font-semibold tracking-tight">Menu</span>
      </button>

      {/* 2. Specials Tab */}
      <button
        type="button"
        onClick={handleSpecialsClick}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'specials'
            ? 'text-[#E8602C]'
            : 'text-[#8C8275] hover:text-[#1A1A1A]'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${activeTab === 'specials' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className="text-[11px] font-semibold tracking-tight">Specials</span>
      </button>

      {/* 3. Food Assistant Tab */}
      <button
        type="button"
        onClick={handleAssistantClick}
        className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'assistant'
            ? 'text-[#E8602C]'
            : 'text-[#8C8275] hover:text-[#1A1A1A]'
        }`}
      >
        <div className="relative">
          <Bot className={`w-5 h-5 ${activeTab === 'assistant' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E8602C] animate-pulse" />
        </div>
        <span className="text-[11px] font-semibold tracking-tight">Assistant</span>
      </button>

      {/* 4. Ratings Tab */}
      <button
        type="button"
        onClick={handleRatingsClick}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'ratings'
            ? 'text-[#E8602C]'
            : 'text-[#8C8275] hover:text-[#1A1A1A]'
        }`}
      >
        <Star className={`w-5 h-5 ${activeTab === 'ratings' ? 'stroke-[2.5] fill-[#E8602C]' : 'stroke-[1.75]'}`} />
        <span className="text-[11px] font-semibold tracking-tight">Ratings</span>
      </button>
    </nav>
  );
};
