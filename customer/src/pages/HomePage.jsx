import React, { useRef, useState } from 'react';
import { AnnouncementStrip } from '../components/layout/AnnouncementStrip';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/layout/HeroSection';
import { TableBanner } from '../components/layout/TableBanner';
import { TodaysSpecials } from '../components/menu/TodaysSpecials';
import { PopularDishes } from '../components/menu/PopularDishes';
import { CategoryNavigation } from '../components/menu/CategoryNavigation';
import { SearchBar } from '../components/menu/SearchBar';
import { FoodGrid } from '../components/menu/FoodGrid';
import { FoodDetailModal } from '../components/menu/FoodDetailModal';
import { RestaurantFooter } from '../components/layout/RestaurantFooter';
import { FoodAssistant } from '../components/chatbot/FoodAssistant';
import { BottomNavigation } from '../components/layout/BottomNavigation';

export const HomePage = () => {
  const [activeBottomTab, setActiveBottomTab] = useState('menu');
  const [assistantOpen, setAssistantOpen] = useState(false);

  const handleSearchShortcut = () => {
    const el = document.getElementById('search-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenRatings = () => {
    const target = document.getElementById('menu-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] pb-16 sm:pb-0">
      {/* 1. Announcement Strip */}
      <AnnouncementStrip />

      {/* 2. Compact Navigation Header & Table Sub-bar matching Screen 1 */}
      <Navbar onSearchClick={handleSearchShortcut} />

      {/* 3. Mobile-First Hero Section matching Screen 1 */}
      <HeroSection />

      {/* Desktop Table Banner (Hidden on Mobile for Lean Native Flow) */}
      <div className="hidden sm:block">
        <TableBanner />
      </div>

      {/* 4. Today's Specials matching Screen 1 */}
      <TodaysSpecials />

      {/* Desktop Popular Dishes Carousel (Hidden on Mobile to match Screen 1 layout) */}
      <div className="hidden sm:block">
        <PopularDishes />
      </div>

      {/* 5. Explore by Category + Sticky Compact Category Bar + Dietary Filter Bar */}
      <CategoryNavigation />

      {/* 6. Main Menu Discovery Container (2-Column Mobile Grid matching Screen 2) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div id="search-anchor" className="mb-6">
          <SearchBar />
        </div>

        <FoodGrid />
      </main>

      {/* 7. Food Details Modal / Bottom Sheet matching Screen 3 */}
      <FoodDetailModal />

      {/* 8. Food Assistant matching Screen 4 */}
      <FoodAssistant
        isOpenExternal={assistantOpen}
        onCloseExternal={() => setAssistantOpen(false)}
      />

      {/* 9. Restaurant Footer */}
      <RestaurantFooter />

      {/* 10. Fixed Mobile Bottom Navigation Bar matching Screen 1 & 2 */}
      <BottomNavigation
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenRatings={handleOpenRatings}
      />
    </div>
  );
};
