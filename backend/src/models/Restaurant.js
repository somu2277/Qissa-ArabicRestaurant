import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Qissa Arabic Restaurant',
      trim: true,
    },
    arabicName: {
      type: String,
      default: 'مطعم قصة العربي',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Every Dish Tells a Story',
    },
    subtitle: {
      type: String,
      default: 'Authentic Arabic & Middle Eastern Cuisine crafted with love, spices, and age-old culinary tradition.',
    },
    logo: {
      type: String,
      default: '/assets/images/logo.png',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    },
    address: {
      type: String,
      default: 'Plot 42, Food Street, Central Avenue (Contact staff for exact address)',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    openingHours: {
      type: String,
      default: '12:00 PM – 11:30 PM (All 7 Days)',
    },
    currency: {
      type: String,
      default: '₹',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com' },
      facebook: { type: String, default: 'https://facebook.com' },
      whatsapp: { type: String, default: '+919876543210' },
    },
    announcement: {
      text: { type: String, default: '🎉 Welcome to Qissa! Enjoy our authentic Charcoal Grilled Platters & Fresh Cold Mezze.' },
      isActive: { type: Boolean, default: true },
      type: { type: String, enum: ['info', 'special', 'alert'], default: 'special' },
    },
    chatbotSettings: {
      isEnabled: { type: Boolean, default: true },
      welcomePopupEnabled: { type: Boolean, default: true },
      welcomeMessage: {
        type: String,
        default: 'Marhaba! 👋 Welcome to Qissa. Looking for something specific? Ask me for spicy grills, hearty rice, mezze, or sweet desserts!',
      },
      fallbackMessage: {
        type: String,
        default: 'I could not find exact dishes matching your search. Try picking from the categories below or browse our signature platters!',
      },
      maxRecommendations: { type: Number, default: 6 },
      quickChips: [
        {
          type: String,
          default: [
            'Spicy Food',
            'Grilled Food',
            'Light & Fresh',
            'Desserts',
            'Rice Dishes',
            'Shawarma',
            'Under ₹300',
            'Vegetarian',
          ],
        },
      ],
    },
    ratingsSettings: {
      isEnabled: { type: Boolean, default: true },
      sessionExpiryHours: { type: Number, default: 4 },
    },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
