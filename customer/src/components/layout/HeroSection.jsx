import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroSection = () => {
  const { restaurant } = useMenu();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'Authentic Arabic Flavours',
      subtitle: 'A Middle Eastern culinary journey at your table',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      badge: 'Chef Signature',
    },
    {
      title: 'Slow-Cooked Yemeni Mandi',
      subtitle: 'Fragrant basmati rice & slow-cooked succulent meats',
      image:
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      badge: 'Popular Delight',
    },
    {
      title: 'Wood-Fired Clay Oven',
      subtitle: 'Freshly baked Manakeesh, fresh pita & hot mezzes',
      image:
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      badge: 'Oven Fresh',
    },
  ];

  const current = slides[activeSlide];

  const handleExploreClick = (e) => {
    e.preventDefault();
    const target = document.getElementById('explore-categories') || document.getElementById('menu-section');
    if (target) {
      const navOffset = 120;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      {/* Mobile-first App-Style Hero Banner matching Screen 1 */}
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-[#1C1713] via-[#241E18] to-[#120F0D] text-white overflow-hidden shadow-md border border-[#382E24]/60">
        {/* Background glow effects */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#E8602C]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-[#C9953C]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-row items-center justify-between p-5 sm:p-7 md:p-9 min-h-[180px] sm:min-h-[220px]">
          {/* Left Text Content */}
          <div className="flex-1 pr-3 sm:pr-6 max-w-md">
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#FAF6F0]">
              {current.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#C9BFB2] mt-1.5 line-clamp-2 leading-relaxed">
              {current.subtitle}
            </p>

            <div className="mt-3.5 sm:mt-5">
              <a
                href="#menu-section"
                onClick={handleExploreClick}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#E8602C]/25 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Floating Dish Graphic */}
          <div className="relative shrink-0 w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56">
            <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx
                  ? 'w-5 bg-[#E8602C]'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
