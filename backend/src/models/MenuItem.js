import mongoose from 'mongoose';

const PriceOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Chicken", "Lamb", "Quarter", "Veg"
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    arabicName: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    priceOptions: [PriceOptionSchema],
    isVeg: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    primaryImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    availabilityNote: {
      type: String,
      default: '',
    },
    badges: [
      {
        type: String,
        enum: ['bestseller', 'new', 'chef_choice', 'popular', 'special'],
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    flavours: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    preparationMethods: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    characteristics: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    mealRole: {
      type: String,
      lowercase: true,
      trim: true,
      default: 'main',
    },
    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    allergens: [
      {
        type: String,
        trim: true,
      },
    ],
    allergenNote: {
      type: String,
      default: 'Please confirm allergens with restaurant staff before placing order.',
    },
    preparationTime: {
      type: String,
      default: '15-20 mins',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Compound indexes for high-speed menu queries
MenuItemSchema.index({ categoryId: 1, isActive: 1, isAvailable: 1 });
MenuItemSchema.index({ isVeg: 1, isActive: 1 });
MenuItemSchema.index({ name: 'text', description: 'text', keywords: 'text' });

export const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
