import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    adminEmail: {
      type: String,
      default: 'system',
    },
    action: {
      type: String,
      required: true, // e.g. "ITEM_CREATED", "PRICE_UPDATED", "AVAILABILITY_CHANGED", "SPECIAL_UPDATED", "QR_GENERATED"
      index: true,
    },
    targetType: {
      type: String,
      required: true, // "MenuItem", "Category", "Table", "Special", "Settings"
    },
    targetId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
