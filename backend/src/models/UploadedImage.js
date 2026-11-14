import mongoose from 'mongoose';

const UploadedImageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    originalName: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      default: 'image/jpeg',
    },
    size: {
      type: Number,
      default: 0,
    },
    data: {
      type: Buffer,
      required: true,
    },
    dataUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const UploadedImage = mongoose.model('UploadedImage', UploadedImageSchema);
