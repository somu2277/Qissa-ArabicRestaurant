import mongoose from 'mongoose';
import crypto from 'crypto';

const TableSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // e.g. "T01", "T02"
    },
    qrToken: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 4,
    },
    location: {
      type: String,
      default: 'Main Dining Hall',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Table = mongoose.model('Table', TableSchema);
