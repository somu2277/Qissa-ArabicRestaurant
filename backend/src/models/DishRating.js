import mongoose from 'mongoose';

const DishRatingSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      index: true,
    },
    tableVisitSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableVisitSession',
      required: true,
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// One rating per dish per table-visit session
DishRatingSchema.index({ menuItemId: 1, tableVisitSessionId: 1 }, { unique: true });
DishRatingSchema.index({ menuItemId: 1, createdAt: -1 });

export const DishRating = mongoose.model('DishRating', DishRatingSchema);
