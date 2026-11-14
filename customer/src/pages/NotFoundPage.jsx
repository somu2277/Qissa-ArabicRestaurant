import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF6F0] text-center">
      <h1 className="font-serif text-6xl font-bold text-[#E8602C] mb-2">404</h1>
      <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-4">Page Not Found</h2>
      <p className="text-sm text-[#6B655D] max-w-sm mb-6">
        The page you are looking for does not exist. Tap below to return to our restaurant menu.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-full bg-[#E8602C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#D14E1E] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Return to Menu</span>
      </Link>
    </div>
  );
};
