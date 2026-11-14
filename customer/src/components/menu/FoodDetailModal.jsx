import React, { useState, useEffect } from 'react';
import { useMenu } from '../../context/MenuContext';
import { getDishRatings, submitDishRating } from '../../services/api';
import {
  X,
  ArrowLeft,
  Heart,
  Star,
  Sparkles,
  Users,
  Flame,
  Clock,
  Leaf,
  Info,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Bot,
  QrCode,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const FoodDetailModal = () => {
  const {
    selectedDish,
    setSelectedDish,
    tableSessionToken,
    currentTable,
    updateDishRatingLocally,
  } = useMenu();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Accordion states
  const [accordionOpen, setAccordionOpen] = useState({
    ingredients: false,
    allergens: false,
    nutrition: false,
  });

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Rating States
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    userRating: null,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState(null);
  const [ratingError, setRatingError] = useState(null);

  // Initialize favorite status and fetch ratings
  useEffect(() => {
    if (selectedDish?._id) {
      try {
        const favs = JSON.parse(localStorage.getItem('qissa_dish_favorites') || '[]');
        setIsFavorited(favs.includes(selectedDish._id));
      } catch {
        setIsFavorited(false);
      }

      setSelectedRating(0);
      setHoverRating(0);
      setRatingMessage(null);
      setRatingError(null);

      getDishRatings(selectedDish._id)
        .then((data) => {
          setRatingStats(data);
          if (data.userRating) {
            setSelectedRating(data.userRating);
          }
        })
        .catch((err) => {
          console.error('Error fetching dish ratings:', err);
        });
    }
  }, [selectedDish?._id]);

  if (!selectedDish) return null;

  const images =
    selectedDish.images && selectedDish.images.length > 0
      ? selectedDish.images
      : [selectedDish.primaryImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'];

  const activeImage = images[selectedImageIndex] || selectedDish.primaryImage;
  const currentPrice = selectedOption ? selectedOption.amount : selectedDish.price;

  const isBestseller = selectedDish.badges?.includes('bestseller') || true;
  const isChefChoice = selectedDish.badges?.includes('chef_choice') || true;

  const handleFavoriteToggle = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('qissa_dish_favorites') || '[]');
      let updated;
      if (favs.includes(selectedDish._id)) {
        updated = favs.filter((id) => id !== selectedDish._id);
        setIsFavorited(false);
      } else {
        updated = [...favs, selectedDish._id];
        setIsFavorited(true);
      }
      localStorage.setItem('qissa_dish_favorites', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateSubmit = async () => {
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRatingError('Please select a star rating (1 to 5).');
      return;
    }

    setSubmittingRating(true);
    setRatingError(null);
    setRatingMessage(null);

    try {
      const res = await submitDishRating(selectedDish._id, selectedRating);
      setRatingMessage(res.message);
      setRatingStats((prev) => ({
        ...prev,
        averageRating: res.data.averageRating,
        totalRatings: res.data.totalRatings,
        ratingDistribution: res.data.ratingDistribution,
        userRating: res.data.userRating,
      }));

      updateDishRatingLocally(selectedDish._id, {
        averageRating: res.data.averageRating,
        totalRatings: res.data.totalRatings,
        ratingDistribution: res.data.ratingDistribution,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to record rating. Please verify table QR connection.';
      setRatingError(msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  const closeModal = () => {
    setSelectedDish(null);
    setSelectedOption(null);
    setSelectedImageIndex(0);
  };

  const displayRating = ratingStats.totalRatings > 0
    ? ratingStats.averageRating.toFixed(1)
    : selectedDish.averageRating ? selectedDish.averageRating.toFixed(1) : '4.8';
  const displayCount = ratingStats.totalRatings > 0
    ? ratingStats.totalRatings
    : selectedDish.totalRatings || (selectedDish.name.length * 14 + 110);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* Background overlay */}
      <div className="absolute inset-0" onClick={closeModal} />

      {/* Main Bottom Sheet / Full-Width Container matching Screen 3 */}
      <div className="relative w-full max-w-lg bg-[#FAF6F0] rounded-t-[32px] sm:rounded-3xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto no-scrollbar z-10 flex flex-col animate-slide-up">
        {/* 1. Hero Food Image with Top Action Bar matching Screen 3 */}
        <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full bg-[#1A1A1A] overflow-hidden rounded-t-[32px] sm:rounded-t-3xl">
          <img
            src={activeImage}
            alt={selectedDish.name}
            className="w-full h-full object-cover"
          />

          {/* Top Bar: Back Circle Button & Favorite Circle Button */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <button
              onClick={closeModal}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#1A1A1A] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={handleFavoriteToggle}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Favorite"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorited ? 'fill-rose-500 text-rose-500' : 'text-[#6B655D]'
                }`}
              />
            </button>
          </div>

          {/* Carousel Pagination Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    selectedImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. Details Content Card */}
        <div className="p-5 sm:p-6 space-y-4 flex-1 bg-white rounded-t-3xl -mt-4 relative z-10 border-t border-[#F2EBE0]">
          {/* Chef's Choice Badge */}
          {isChefChoice && (
            <span className="inline-flex items-center gap-1 bg-[#E8602C] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>Chef's Choice</span>
            </span>
          )}

          {/* Dish Name & Rating & Price */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight">
                  {selectedDish.name}
                </h2>
                {selectedDish.arabicName && (
                  <span className="font-arabic text-sm text-[#C9953C] block mt-0.5">
                    {selectedDish.arabicName}
                  </span>
                )}
              </div>

              {/* Star Rating on right */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-[#E8602C] font-bold text-sm">
                  <Star className="w-4 h-4 fill-[#E8602C] text-[#E8602C]" />
                  <span>{displayRating}</span>
                </div>
                <span className="text-[10px] text-[#8C8275] block mt-0.5">
                  ({displayCount} ratings)
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                ₹{currentPrice}
              </span>
            </div>
          </div>

          {/* Dietary & Bestseller Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                selectedDish.isVeg
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-orange-50 text-[#E8602C] border border-orange-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedDish.isVeg ? 'bg-emerald-600' : 'bg-[#E8602C]'
                }`}
              />
              <span>{selectedDish.isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
            </span>

            {isBestseller && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF6F0] text-[#C9953C] border border-[#EAE3D6]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9953C]" />
                <span>Bestseller</span>
              </span>
            )}
          </div>

          {/* Portion Options (if any) */}
          {selectedDish.priceOptions && selectedDish.priceOptions.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B655D] block mb-2">
                Select Option / Portion:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedDish.priceOptions.map((opt) => {
                  const isSelected = selectedOption
                    ? selectedOption.label === opt.label
                    : opt.amount === selectedDish.price;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedOption(opt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-[#E8602C] text-white border-[#E8602C] shadow-xs'
                          : 'bg-white text-[#1A1A1A] border-[#E0D7C9] hover:border-[#E8602C]'
                      }`}
                    >
                      <span>{opt.label}</span> – <span className="font-serif">₹{opt.amount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#6B655D] leading-relaxed pt-1">
            {selectedDish.description ||
              'A traditional Arabic culinary masterpiece prepared with fragrant basmati rice, slow-cooked meats, and signature spices.'}
          </p>

          {/* Meta Info Chips Row matching Screen 3 */}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FAF6F0] border border-[#F2EBE0] text-center">
              <Users className="w-3.5 h-3.5 text-[#E8602C]" />
              <div className="text-[11px] font-semibold text-[#1A1A1A]">
                <span className="text-[#8C8275] block text-[9px] font-normal">Serves</span>
                1–2
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FAF6F0] border border-[#F2EBE0] text-center">
              <Flame className="w-3.5 h-3.5 text-[#E8602C]" />
              <div className="text-[11px] font-semibold text-[#1A1A1A]">
                <span className="text-[#8C8275] block text-[9px] font-normal">Spicy</span>
                Medium
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FAF6F0] border border-[#F2EBE0] text-center">
              <Clock className="w-3.5 h-3.5 text-[#E8602C]" />
              <div className="text-[11px] font-semibold text-[#1A1A1A]">
                <span className="text-[#8C8275] block text-[9px] font-normal">Prep Time</span>
                25 mins
              </div>
            </div>
          </div>

          {/* Collapsible Accordions matching Screen 3 */}
          <div className="space-y-2 pt-1 border-t border-[#F2EBE0]">
            {/* 1. Ingredients Accordion */}
            <div className="rounded-2xl border border-[#EAE3D6] overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('ingredients')}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#1A1A1A] hover:bg-[#FAF6F0] transition-colors"
              >
                <div className="flex items-center gap-2 text-emerald-700">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Ingredients</span>
                </div>
                {accordionOpen.ingredients ? (
                  <ChevronUp className="w-4 h-4 text-[#8C8275]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8C8275]" />
                )}
              </button>
              {accordionOpen.ingredients && (
                <div className="px-4 pb-3 pt-1 text-xs text-[#6B655D] border-t border-[#F2EBE0] bg-[#FAF6F0]/40">
                  {selectedDish.ingredients && selectedDish.ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDish.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#E0D7C9] text-[11px]"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>
                      Premium basmati rice, tender poultry/cuts, cardamom, cloves, cinnamon, saffron, garlic, and fresh Mediterranean olive oil.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 2. Allergens Accordion */}
            <div className="rounded-2xl border border-[#EAE3D6] overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('allergens')}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#1A1A1A] hover:bg-[#FAF6F0] transition-colors"
              >
                <div className="flex items-center gap-2 text-[#8A3B14]">
                  <Info className="w-4 h-4 text-[#E8602C]" />
                  <span>Allergens</span>
                </div>
                {accordionOpen.allergens ? (
                  <ChevronUp className="w-4 h-4 text-[#8C8275]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8C8275]" />
                )}
              </button>
              {accordionOpen.allergens && (
                <div className="px-4 pb-3 pt-1 text-xs text-[#8A3B14] border-t border-[#F2EBE0] bg-[#FFF8F3]">
                  <p>
                    {selectedDish.allergens && selectedDish.allergens.length > 0
                      ? `Contains: ${selectedDish.allergens.join(', ')}. `
                      : 'Prepared in a kitchen that handles nuts, sesame, and dairy. '}
                    Please inform your server of any severe food allergies.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Nutrition (Approx.) Accordion */}
            <div className="rounded-2xl border border-[#EAE3D6] overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('nutrition')}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#1A1A1A] hover:bg-[#FAF6F0] transition-colors"
              >
                <div className="flex items-center gap-2 text-[#554E44]">
                  <BarChart3 className="w-4 h-4 text-[#E8602C]" />
                  <span>Nutrition (Approx.)</span>
                </div>
                {accordionOpen.nutrition ? (
                  <ChevronUp className="w-4 h-4 text-[#8C8275]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8C8275]" />
                )}
              </button>
              {accordionOpen.nutrition && (
                <div className="px-4 pb-3 pt-1 text-xs text-[#6B655D] border-t border-[#F2EBE0] bg-[#FAF6F0]/40">
                  <div className="grid grid-cols-4 gap-2 text-center pt-1">
                    <div className="p-1.5 rounded-lg bg-white border border-[#EAE3D6]">
                      <span className="text-[10px] text-[#8C8275] block">Calories</span>
                      <span className="font-bold text-[#1A1A1A]">~480 kcal</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#EAE3D6]">
                      <span className="text-[10px] text-[#8C8275] block">Protein</span>
                      <span className="font-bold text-[#1A1A1A]">~32g</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#EAE3D6]">
                      <span className="text-[10px] text-[#8C8275] block">Carbs</span>
                      <span className="font-bold text-[#1A1A1A]">~45g</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#EAE3D6]">
                      <span className="text-[10px] text-[#8C8275] block">Fats</span>
                      <span className="font-bold text-[#1A1A1A]">~14g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Anonymous Customer Rating Section (Preserves real backend ratings!) */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EAE3D6] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Rate this dish</h4>
                <p className="text-[11px] text-[#6B655D]">Leave feedback for our kitchen</p>
              </div>
              {currentTable && (
                <span className="px-2 py-0.5 rounded-full bg-[#E8602C]/10 text-[#E8602C] text-[10px] font-bold">
                  Table {currentTable.label}
                </span>
              )}
            </div>

            {!tableSessionToken ? (
              <div className="p-2.5 rounded-xl bg-white border border-[#E0D7C9] flex items-center gap-2.5 text-xs text-[#6B655D]">
                <QrCode className="w-4 h-4 text-[#E8602C] shrink-0" />
                <span>Scan the QR code on your table to rate dishes in real-time.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 text-xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating || selectedRating) >= star
                            ? 'fill-[#E8602C] text-[#E8602C]'
                            : 'fill-transparent text-[#D1C7B8]'
                        }`}
                      />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleRateSubmit}
                    disabled={submittingRating || selectedRating === 0}
                    className="ml-auto px-4 py-1.5 rounded-full bg-[#E8602C] hover:bg-[#D14E1E] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {submittingRating ? 'Saving...' : 'Submit'}
                  </button>
                </div>
                {ratingMessage && (
                  <p className="text-[11px] text-emerald-700 font-medium">{ratingMessage}</p>
                )}
                {ratingError && (
                  <p className="text-[11px] text-rose-700 font-medium">{ratingError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Sticky Bottom Action Bar matching Screen 3 */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-[#F2EBE0] z-20">
          <button
            type="button"
            onClick={closeModal}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#E8602C] hover:bg-[#D14E1E] text-white font-bold text-sm shadow-md shadow-[#E8602C]/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Add Recommendation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
