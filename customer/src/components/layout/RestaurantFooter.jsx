import React from 'react';
import { useMenu } from '../../context/MenuContext';
import { Clock, Phone, MapPin, Instagram, Facebook, MessageCircle, Heart } from 'lucide-react';

export const RestaurantFooter = () => {
  const { restaurant } = useMenu();

  const galleryImages = [
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  ];

  return (
    <footer id="footer" className="bg-[#1A1A1A] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Visual Instagram / Food Gallery Strip */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C9953C] font-semibold">
                Captured Moments
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">Food & Atmosphere</h3>
            </div>
            <span className="text-xs text-white/60">@qissa.restaurant</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {galleryImages.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer"
              >
                <img
                  src={src}
                  alt="Restaurant ambiance"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          {/* Brand Intro */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8602C] text-white flex items-center justify-center font-arabic text-xl font-bold">
                ق
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold">{restaurant?.name || 'Qissa Arabic Restaurant'}</h4>
                <span className="font-arabic text-sm text-[#C9953C]">قصة للمأكولات العربية</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-white/70 max-w-md leading-relaxed">
              Every dish is a chapter in our culinary journey. We bring you the true authentic warmth of
              Arabic hospitality, slow-smoked charcoal meats, fragrant Yemen mandi, and rich mezze platters.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={restaurant?.socialLinks?.instagram || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E8602C] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={restaurant?.socialLinks?.facebook || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E8602C] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${(restaurant?.phone || '').replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E8602C] text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-sm tracking-wider uppercase text-[#C9953C]">
              Opening Hours
            </h5>
            <div className="flex items-start gap-2.5 text-xs text-white/80">
              <Clock className="w-4 h-4 text-[#E8602C] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Daily Dining & Takeout</p>
                <p className="text-white/60">{restaurant?.openingHours || '12:00 PM – 11:30 PM'}</p>
                <p className="text-[11px] text-emerald-400 mt-1">● Kitchen Open Now</p>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-sm tracking-wider uppercase text-[#C9953C]">
              Contact & Location
            </h5>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E8602C] shrink-0 mt-0.5" />
                <span>{restaurant?.address || 'Shop 12-14, Gourmet Galleria, Main Boulevard'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E8602C] shrink-0" />
                <a href={`tel:${restaurant?.phone}`} className="hover:text-[#E8602C] transition-colors">
                  {restaurant?.phone || '+91 98765 43210'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Qissa Arabic Restaurant. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#E8602C] fill-[#E8602C]" />
            <span>for authentic Arabic dining</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
