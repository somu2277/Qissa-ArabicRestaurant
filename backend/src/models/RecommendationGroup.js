import mongoose from 'mongoose';

const RecommendationGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    tagFilters: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    menuItemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const RecommendationGroup = mongoose.model('RecommendationGroup', RecommendationGroupSchema);
