import React from 'react';
import { useMenu } from '../../context/MenuContext';
import { Search, X } from 'lucide-react';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useMenu();

  return (
    <div className="relative max-w-xl mx-auto mb-6">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-[#E8602C] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Mandi, Shawarma, Hummus, Kebabs..."
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E0D7C9] focus:border-[#E8602C] rounded-full text-sm text-[#1A1A1A] placeholder-[#6B655D]/60 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#E8602C]/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 p-1 rounded-full text-[#6B655D] hover:text-[#1A1A1A] hover:bg-[#F2EBE0] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
