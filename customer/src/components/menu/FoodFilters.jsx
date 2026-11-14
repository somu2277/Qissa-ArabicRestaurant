import React from 'react';
import { useMenu } from '../../context/MenuContext';

export const FoodFilters = () => {
  const { dietaryFilter, setDietaryFilter, availableOnly, setAvailableOnly } = useMenu();

  const dietaryOptions = [
    { id: 'all', label: 'All', icon: null },
    { id: 'veg', label: 'Veg', icon: '🌱' },
    { id: 'non-veg', label: 'Non-Veg', icon: '🍗' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-sm p-2 sm:p-2.5 rounded-2xl border border-[#EAE3D6] shadow-xs">
      {/* 1. Dietary Filter Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {dietaryOptions.map((opt) => {
          const isActive = dietaryFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setDietaryFilter(opt.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 select-none ${
                isActive
                  ? 'bg-[#E8602C] text-white shadow-sm shadow-[#E8602C]/30 scale-[1.02]'
                  : 'bg-white border border-[#E0D7C9] text-[#554E44] hover:border-[#E8602C] hover:text-[#1A1A1A]'
              }`}
            >
              {opt.icon && <span className="text-xs">{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Available Only Toggle Switch */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-xs font-semibold text-[#554E44] whitespace-nowrap">
          Available Only
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={availableOnly}
          onClick={() => setAvailableOnly(!availableOnly)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E8602C] focus:ring-offset-1 ${
            availableOnly ? 'bg-[#E8602C]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              availableOnly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </label>
    </div>
  );
};
