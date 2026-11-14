import mongoose from 'mongoose';

const MenuInteractionSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      index: true,
    },
    interactionType: {
      type: String,
      enum: ['view', 'detail_open', 'assistant_recommended', 'search_hit'],
      default: 'view',
    },
    tableToken: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

MenuInteractionSchema.index({ createdAt: -1 });

export const MenuInteraction = mongoose.model('MenuInteraction', MenuInteractionSchema);
