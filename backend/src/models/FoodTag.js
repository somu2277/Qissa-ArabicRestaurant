import mongoose from 'mongoose';

const FoodTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['flavour', 'preparation', 'characteristic', 'mealRole', 'ingredient'],
      default: 'flavour',
    },
    synonyms: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

export const FoodTag = mongoose.model('FoodTag', FoodTagSchema);
