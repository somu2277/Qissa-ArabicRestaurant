import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMenu } from '../../context/MenuContext';
import { Check, ArrowRight, ChevronLeft, ChevronRight, Utensils, Leaf, Drumstick, Sparkles } from 'lucide-react';

const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';

const getShortCategoryName = (name = '') => {
  if (name.includes('Shurba') || name.includes('Soup')) return 'Shurba';
  if (name.includes('Sulta') || name.includes('Salad')) return 'Salads';
  if (name.includes('Hummus')) return 'Hummus';
  if (name.includes('Cold Mezze')) return 'Cold Mezze';
  if (name.includes('Hot Mezze')) return 'Hot Mezze';
  if (name.includes('Clay Oven')) return 'Clay Oven';
  if (name.includes('Grill')) return 'Grills';
  if (name.includes('Shawarma')) return 'Shawarma';
  if (name.includes('Rice')) return 'Rice Pot';
  if (name.includes('Gravy') || name.includes('Stew')) return 'Gravy';
  if (name.includes('Rolls') || name.includes('Pockets')) return 'Rolls';
  if (name.includes('Dessert')) return 'Desserts';
  if (name.includes('Drinks')) return 'Drinks';
  if (name.includes('Beverage')) return 'Beverages';
  return name.split('/')[0].trim();
};

export const CategoryNavigation = () => {
  const {
    categories,
    activeCategory,
    selectCategory,
    dishCountsByCategory,
    dietaryFilter,
    setDietaryFilter,
  } = useMenu();

  const [isSticky, setIsSticky] = useState(false);
  const [spyCategory, setSpyCategory] = useState(null);

  const initialSectionRef = useRef(null);
  const initialScrollContainerRef = useRef(null);
  const stickyScrollContainerRef = useRef(null);
  const activeInitialCardRef = useRef(null);
  const activeStickyPillRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTimeoutRef = useRef(null);

  const currentActiveId = spyCategory || activeCategory || 'all';

  // 1. Detect scroll position to show/hide the compact sticky navigation bar
  useEffect(() => {
    const handleScroll = () => {
      if (!initialSectionRef.current) return;
      const rect = initialSectionRef.current.getBoundingClientRect();
      // When the bottom of the initial cards section reaches or passes the 64px navbar
      const shouldBeSticky = rect.bottom <= 74;
      setIsSticky(shouldBeSticky);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. ScrollSpy tracking active category or 'all' across all sections
  useEffect(() => {
    const targets = [
      document.getElementById('explore-categories'),
      document.getElementById('menu-header'),
      ...document.querySelectorAll('section[data-category-id]'),
    ].filter(Boolean);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const catId = entry.target.getAttribute('data-category-id');
            if (catId) {
              setSpyCategory(catId);
            } else if (
              entry.target.id === 'explore-categories' ||
              entry.target.id === 'menu-header'
            ) {
              setSpyCategory('all');
            }
          }
        });
      },
      {
        rootMargin: '-120px 0px -60% 0px',
        threshold: 0,
      }
    );

    targets.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [categories]);

  // 3. Auto-scroll active card horizontally into view in the initial cards section
  useEffect(() => {
    if (activeInitialCardRef.current && initialScrollContainerRef.current) {
      const container = initialScrollContainerRef.current;
      const card = activeInitialCardRef.current;
      const cRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      if (cardRect.left < cRect.left || cardRect.right > cRect.right) {
        card.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [currentActiveId]);

  // 4. Auto-scroll active pill horizontally into view in the compact sticky bar
  useEffect(() => {
    if (isSticky && activeStickyPillRef.current && stickyScrollContainerRef.current) {
      activeStickyPillRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentActiveId, isSticky]);

  // Handle category selection
  const handleCategoryClick = useCallback(
    (categoryId) => {
      isProgrammaticScrollRef.current = true;
      setSpyCategory(categoryId);
      if (programmaticTimeoutRef.current) {
        clearTimeout(programmaticTimeoutRef.current);
      }
      programmaticTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 850);

      selectCategory(categoryId);
    },
    [selectCategory]
  );

  const handleScrollLeft = () => {
    if (initialScrollContainerRef.current) {
      initialScrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (initialScrollContainerRef.current) {
      initialScrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const isAllCategoriesActive = activeCategory === 'all';

  if (!categories || categories.length === 0) return null;

  return (
    <>
      {/* ========================================================
          A, B & C: INITIAL CATEGORY SECTION (In Normal Document Flow)
          Displays 1:1 square image cards, equal dimensions,
          aligned labels, and Explore by Category header matching Screen 1.
          ======================================================== */}
      <section
        ref={initialSectionRef}
        id="explore-categories"
        className="w-full bg-[#FAF6F0] py-4 sm:py-6 border-b border-[#F2EBE0]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header matching Screen 1: Explore by Category + View All -> */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[#E8602C]">
                <Sparkles className="w-4 h-4 fill-[#E8602C]" />
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] tracking-tight">
                Explore by Category
              </h2>
            </div>

            <button
              onClick={() => handleCategoryClick('all')}
              className="text-xs font-semibold text-[#E8602C] hover:text-[#D14E1E] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Category Cards Row with Desktop Navigation Buttons */}
          <div className="relative group">
            {/* Scroll Left Button for Desktop */}
            <button
              onClick={handleScrollLeft}
              aria-label="Scroll categories left"
              className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#E0D7C9] shadow-md items-center justify-center text-[#1A1A1A] hover:text-[#E8602C] hover:border-[#E8602C] hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scroll Right Button for Desktop */}
            <button
              onClick={handleScrollRight}
              aria-label="Scroll categories right"
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#E0D7C9] shadow-md items-center justify-center text-[#1A1A1A] hover:text-[#E8602C] hover:border-[#E8602C] hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Cards Scroll Container: Equal dimensions, 1:1 square photos, aligned labels */}
            <div
              ref={initialScrollContainerRef}
              className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
            >
              {/* "All Categories" Card (Default Selected State) */}
              {(() => {
                const isAllActive = currentActiveId === 'all';
                const totalCount = dishCountsByCategory['all'] ?? categories.reduce((sum, c) => sum + (dishCountsByCategory[c._id] ?? 0), 0);

                return (
                  <button
                    key="all"
                    ref={isAllActive ? activeInitialCardRef : null}
                    onClick={() => handleCategoryClick('all')}
                    className={`flex-shrink-0 w-24 sm:w-28 md:w-32 flex flex-col p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border transition-all duration-200 text-left select-none group cursor-pointer ${
                      isAllActive
                        ? 'bg-orange-50/70 border-2 border-[#E8602C] shadow-md shadow-[#E8602C]/15 ring-2 ring-[#E8602C]/20'
                        : 'bg-white border-[#EAE3D6] hover:border-[#E8602C]/60 hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Equal-sized 1:1 Square Image Container */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F2EBE0] border border-[#EAE3D6]/60">
                      <img
                        src="https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400&q=80"
                        alt="All Categories"
                        loading="lazy"
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Selected State Checkmark Badge */}
                      {isAllActive && (
                        <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#E8602C] text-white flex items-center justify-center shadow-md animate-scaleIn">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Aligned Category Label & Dish Count Below Image */}
                    <div className="mt-1.5 text-center flex flex-col items-center justify-center min-h-[38px] px-0.5">
                      <span
                        className={`text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2 w-full transition-colors ${
                          isAllActive ? 'text-[#E8602C]' : 'text-[#1A1A1A] group-hover:text-[#E8602C]'
                        }`}
                      >
                        All Categories
                      </span>
                      <span className="text-[10px] font-medium text-[#8C8275] mt-0.5">
                        ({totalCount})
                      </span>
                    </div>
                  </button>
                );
              })()}

              {categories.map((cat) => {
                const isActive = currentActiveId === cat._id;
                const count = dishCountsByCategory[cat._id] ?? cat.dishCount ?? 0;

                return (
                  <button
                    key={cat._id}
                    ref={isActive ? activeInitialCardRef : null}
                    onClick={() => handleCategoryClick(cat._id)}
                    className={`flex-shrink-0 w-24 sm:w-28 md:w-32 flex flex-col p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border transition-all duration-200 text-left select-none group cursor-pointer ${
                      isActive
                        ? 'bg-orange-50/70 border-2 border-[#E8602C] shadow-md shadow-[#E8602C]/15 ring-2 ring-[#E8602C]/20'
                        : 'bg-white border-[#EAE3D6] hover:border-[#E8602C]/60 hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Equal-sized 1:1 Square Image Container */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F2EBE0] border border-[#EAE3D6]/60">
                      <img
                        src={cat.image || FALLBACK_CATEGORY_IMAGE}
                        alt={cat.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
                        }}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Selected State Checkmark Badge */}
                      {isActive && (
                        <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#E8602C] text-white flex items-center justify-center shadow-md animate-scaleIn">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Aligned Category Label & Dish Count Below Image */}
                    <div className="mt-1.5 text-center flex flex-col items-center justify-center min-h-[38px] px-0.5">
                      <span
                        className={`text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2 w-full transition-colors ${
                          isActive ? 'text-[#E8602C]' : 'text-[#1A1A1A] group-hover:text-[#E8602C]'
                        }`}
                      >
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-medium text-[#8C8275] mt-0.5">
                        ({count})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Dietary Filter Bar below categories matching Screen 1 */}
          <div className="mt-4 pt-3 border-t border-[#F2EBE0] flex items-center gap-2">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                dietaryFilter === 'all'
                  ? 'bg-[#E8602C] text-white shadow-xs'
                  : 'bg-white text-[#554E44] border border-[#E0D7C9] hover:border-[#E8602C]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>All</span>
            </button>

            <button
              onClick={() => setDietaryFilter('veg')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-[#554E44] border border-[#E0D7C9] hover:border-emerald-600'
              }`}
            >
              <Leaf className={`w-3.5 h-3.5 ${dietaryFilter === 'veg' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Veg</span>
            </button>

            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                dietaryFilter === 'non-veg'
                  ? 'bg-[#E8602C] text-white shadow-xs'
                  : 'bg-white text-[#554E44] border border-[#E0D7C9] hover:border-[#E8602C]'
              }`}
            >
              <Drumstick className={`w-3.5 h-3.5 ${dietaryFilter === 'non-veg' ? 'text-white' : 'text-[#E8602C]'}`} />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          D & E: COMPACT STICKY CATEGORY NAVIGATION (After Scrolling)
          Replaces large cards with compact text-only pills.
          Row 1: Category pills [Shurba] [Salads] [Hummus] ...
          Row 2: Dietary filters [All] [Veg] [Non-Veg]
          Docks right below navbar at top-14 / top-16 matching Screen 2.
          ======================================================== */}
      <div
        id="sticky-category-bar"
        className={`fixed top-14 sm:top-16 left-0 right-0 z-30 bg-[#FAF6F0] border-b border-[#EAE3D6] shadow-xs transition-all duration-200 ${
          isSticky
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-1.5">
          {/* Row 1: Horizontal scrolling category pills */}
          <div
            ref={stickyScrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          >
            {/* "All Categories" Pill */}
            <button
              ref={currentActiveId === 'all' ? activeStickyPillRef : null}
              onClick={() => handleCategoryClick('all')}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                currentActiveId === 'all'
                  ? 'bg-[#E8602C] text-white font-semibold shadow-xs'
                  : 'bg-white text-[#554E44] border border-[#E0D7C9] hover:border-[#E8602C] hover:text-[#1A1A1A] font-medium'
              }`}
            >
              All Categories
            </button>

            {/* Category Pills with clean short names */}
            {categories.map((cat) => {
              const isActive = currentActiveId === cat._id;
              const shortName = getShortCategoryName(cat.name);

              return (
                <button
                  key={cat._id}
                  ref={isActive ? activeStickyPillRef : null}
                  onClick={() => handleCategoryClick(cat._id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#E8602C] text-white font-semibold shadow-xs'
                      : 'bg-white text-[#554E44] border border-[#E0D7C9] hover:border-[#E8602C] hover:text-[#1A1A1A] font-medium'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>

          {/* Row 2: Compact Dietary Filters matching Screen 2 */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all shadow-2xs cursor-pointer ${
                dietaryFilter === 'all'
                  ? 'bg-[#E8602C] text-white shadow-xs'
                  : 'bg-white text-[#554E44] border border-[#E0D7C9]'
              }`}
            >
              <Utensils className="w-3 h-3" />
              <span>All</span>
            </button>

            <button
              onClick={() => setDietaryFilter('veg')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all shadow-2xs cursor-pointer ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-[#554E44] border border-[#E0D7C9]'
              }`}
            >
              <Leaf className={`w-3 h-3 ${dietaryFilter === 'veg' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Veg</span>
            </button>

            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all shadow-2xs cursor-pointer ${
                dietaryFilter === 'non-veg'
                  ? 'bg-[#E8602C] text-white shadow-xs'
                  : 'bg-white text-[#554E44] border border-[#E0D7C9]'
              }`}
            >
              <Drumstick className={`w-3 h-3 ${dietaryFilter === 'non-veg' ? 'text-white' : 'text-[#E8602C]'}`} />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
