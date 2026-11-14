import mongoose from 'mongoose';

const SpecialSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
    badgeText: {
      type: String,
      default: "Today's Special",
      trim: true,
    },
    customPrice: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    recurringDays: [
      {
        type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      },
    ],
    startTime: {
      type: String, // HH:mm format e.g. "12:00"
      default: '',
    },
    endTime: {
      type: String, // HH:mm format e.g. "23:00"
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Special = mongoose.model('Special', SpecialSchema);
