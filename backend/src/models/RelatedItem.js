import mongoose from 'mongoose';

const RelatedItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      unique: true,
      index: true,
    },
    relatedItemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
  },
  { timestamps: true }
);

export const RelatedItem = mongoose.model('RelatedItem', RelatedItemSchema);
