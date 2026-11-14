import React from 'react';
import { useMenu } from '../../context/MenuContext';
import { TrendingUp, Sparkles, ChevronRight, Star } from 'lucide-react';
import { resolveDishImage, handleImageError } from '../../utils/imageHelper';

export const PopularDishes = () => {
  const { popularDishes, setSelectedDish, searchQuery, selectedCategory } = useMenu();

  // If user is actively searching, keep focus clean on search results
  if (searchQuery.trim()) return null;
  if (!popularDishes || popularDishes.length === 0) return null;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E8602C]/10 flex items-center justify-center text-[#E8602C]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
              Guest <span className="text-[#E8602C]">Favourites</span>
            </h2>
            <p className="text-xs text-[#6B655D]">Most loved & ordered dishes at Qissa</p>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {popularDishes.slice(0, 6).map((item) => (
          <div
            key={item._id}
            onClick={() => setSelectedDish(item)}
            className="group flex-shrink-0 w-64 sm:w-72 bg-white rounded-3xl overflow-hidden border border-[#F2EBE0] shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-[#FAF6F0]">
              <img
                src={resolveDishImage(item.primaryImage)}
                alt={item.name}
                onError={handleImageError}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 bg-[#C9953C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Bestseller</span>
              </div>
              <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]">
                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1A1A1A] group-hover:text-[#E8602C] transition-colors truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-[#6B655D] line-clamp-1 mt-0.5">{item.description}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px]">
                  {item.totalRatings > 0 ? (
                    <span className="flex items-center gap-1 text-[#E8602C] font-bold">
                      <Star className="w-3 h-3 fill-[#E8602C] text-[#E8602C]" />
                      <span>{(item.averageRating || 0).toFixed(1)}</span>
                      <span className="text-[#6B655D] font-normal">({item.totalRatings})</span>
                    </span>
                  ) : (
                    <span className="text-[#6B655D] italic">Be the first to rate.</span>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#F2EBE0] flex items-center justify-between">
                <span className="font-serif text-lg font-bold text-[#E8602C]">₹{item.price}</span>
                <span className="text-[11px] font-semibold text-[#E8602C] flex items-center group-hover:translate-x-0.5 transition-transform">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
