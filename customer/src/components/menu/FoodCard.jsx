import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { Star, Heart, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { resolveDishImage, handleImageError } from '../../utils/imageHelper';

export const FoodCard = ({ item }) => {
  const { setSelectedDish } = useMenu();
  const [isFavorited, setIsFavorited] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('qissa_dish_favorites') || '[]');
      return favs.includes(item._id);
    } catch {
      return false;
    }
  });

  const isBestseller = item.badges?.includes('bestseller');
  const isChefChoice = item.badges?.includes('chef_choice');
  const isAvailable = item.isAvailable !== false;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('qissa_dish_favorites') || '[]');
      let updated;
      if (favs.includes(item._id)) {
        updated = favs.filter((id) => id !== item._id);
        setIsFavorited(false);
      } else {
        updated = [...favs, item._id];
        setIsFavorited(true);
      }
      localStorage.setItem('qissa_dish_favorites', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = () => {
    if (isAvailable) {
      setSelectedDish(item);
    }
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    if (isAvailable) {
      setSelectedDish(item);
    }
  };

  // Simulated rating format fallback if ratings are new
  const displayRating = item.averageRating ? item.averageRating.toFixed(1) : '4.7';
  const displayCount = item.totalRatings || (item.name.length * 11 + 42);

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EAE3D6] shadow-2xs hover:shadow-md hover:border-[#E8602C]/40 transition-all duration-200 flex flex-col justify-between select-none ${
        isAvailable ? 'cursor-pointer hover:-translate-y-0.5' : 'opacity-70 cursor-not-allowed'
      }`}
    >
      {/* 1. Square Food Photograph (1:1 Aspect Ratio) matching Screen 2 */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0]">
        <img
          src={resolveDishImage(item.primaryImage)}
          alt={item.name}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-Left: Veg / Non-Veg Icon Indicator matching Screen 2 */}
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-5 h-5 rounded-md bg-white/95 backdrop-blur-xs flex items-center justify-center border shadow-2xs ${
              item.isVeg ? 'border-emerald-600' : 'border-rose-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </div>
        </div>

        {/* Top-Right: Circular Favorite Heart Button */}
        <button
          type="button"
          aria-label="Favorite dish"
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-2xs text-[#6B655D] hover:text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-[#8C8275]'
            }`}
          />
        </button>

        {/* Rating Badge Overlay at Bottom-Left of Image */}
        <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-white/80">
          <Star className="w-3 h-3 fill-[#E8602C] text-[#E8602C]" />
          <span className="text-[10px] font-bold text-[#1A1A1A]">{displayRating}</span>
          <span className="text-[9px] text-[#8C8275] font-medium">({displayCount})</span>
        </div>

        {/* Unavailability Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 text-center z-20">
            <div className="bg-white/95 px-2.5 py-1 rounded-xl text-rose-600 text-[11px] font-bold flex items-center gap-1 shadow-md">
              <AlertCircle className="w-3 h-3" />
              <span>Unavailable</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Card Content Below Image */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#1A1A1A] group-hover:text-[#E8602C] transition-colors line-clamp-1 leading-snug">
            {item.name}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-[#6B655D] line-clamp-2 mt-0.5 leading-snug">
            {item.description || 'Traditional Middle Eastern recipe freshly prepared with herbs.'}
          </p>
        </div>

        {/* 3. Bottom Row: Price & Vibrant Orange Plus Button */}
        <div className="pt-2 mt-2 border-t border-[#F2EBE0] flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#1A1A1A]">
              ₹{item.price}
            </span>
            {item.priceOptions && item.priceOptions.length > 0 && (
              <span className="text-[9px] text-[#8C8275] ml-0.5">+</span>
            )}
          </div>

          <button
            type="button"
            onClick={handlePlusClick}
            aria-label={`View ${item.name}`}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#E8602C] hover:bg-[#D14E1E] text-white flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
