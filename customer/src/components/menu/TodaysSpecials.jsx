import React from 'react';
import { useMenu } from '../../context/MenuContext';
import { Sparkles, Utensils, Star, Flame } from 'lucide-react';

export const TodaysSpecials = () => {
  const { specials, setSelectedDish } = useMenu();

  if (!specials || specials.length === 0) return null;

  return (
    <section id="specials-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header: Today's Special 🔥 and View All */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[#E8602C]">
            <Flame className="w-4 h-4 fill-[#E8602C]" />
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
            Today's Special <span className="inline-block">🔥</span>
          </h2>
        </div>

        <a
          href="#menu-section"
          className="text-xs font-semibold text-[#E8602C] hover:text-[#D14E1E] transition-colors"
        >
          View All
        </a>
      </div>

      {/* Specials Cards: Horizontal Featured Card on Mobile, Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {specials.map((spec) => {
          const item = spec.menuItemId;
          if (!item) return null;

          const displayPrice = spec.customPrice || item.price;

          return (
            <div
              key={spec._id}
              onClick={() => setSelectedDish(item)}
              className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#EAE3D6] shadow-2xs hover:shadow-md hover:border-[#E8602C]/50 transition-all duration-300 cursor-pointer flex flex-row items-center gap-3.5"
            >
              {/* Left: Square Food Image with Chef's Choice Badge */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-[#FAF6F0]">
                <img
                  src={item.primaryImage}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-1.5 left-1.5 bg-[#E8602C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Chef's Choice</span>
                </div>
              </div>

              {/* Right: Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#E8602C] transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#6B655D] line-clamp-2 mt-0.5 leading-snug">
                    {item.description || 'Slow-cooked aromatic rice with tender meat and spices'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F2EBE0]">
                  <span className="font-serif font-bold text-sm sm:text-base text-[#E8602C]">
                    ₹{displayPrice}
                  </span>

                  {item.totalRatings > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-[#6B655D]">
                      <Star className="w-3 h-3 fill-[#E8602C] text-[#E8602C]" />
                      <span className="font-semibold text-[#1A1A1A]">
                        {(item.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
