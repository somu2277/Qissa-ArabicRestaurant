import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ENV } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Cloudinary if credentials are provided
const isCloudinaryConfigured = !!(
  ENV.CLOUDINARY_CLOUD_NAME &&
  ENV.CLOUDINARY_API_KEY &&
  ENV.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[ImageUploadService] Cloudinary configured successfully.');
} else {
  console.log(
    '[ImageUploadService] Cloudinary credentials not detected; using local storage (/uploads).'
  );
}

// Multer memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WebP are allowed.'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter,
});

/**
 * Uploads a single file buffer to Cloudinary or local disk
 * @param {Express.Multer.File} file
 * @returns {Promise<{url: string, public_id?: string, filename: string, storage: 'cloudinary' | 'local'}>}
 */
export async function processAndUploadImage(file) {
  if (!file || !file.buffer) {
    throw new Error('No image file provided for upload.');
  }

  // 1. If Cloudinary is available, stream upload to Cloudinary
  if (isCloudinaryConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'qissa/dishes',
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, res) => {
            if (error) return reject(error);
            resolve(res);
          }
        );
        uploadStream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
        filename: path.basename(result.secure_url),
        storage: 'cloudinary',
      };
    } catch (err) {
      console.warn(
        '[ImageUploadService] Cloudinary upload failed, falling back to local storage:',
        err.message
      );
    }
  }

  // 2. Local Fallback Storage
  const ext = path.extname(file.originalname) || (file.mimetype.includes('png') ? '.png' : file.mimetype.includes('webp') ? '.webp' : '.jpg');
  const filename = `dish_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(filePath, file.buffer);

  // Return public URL served by express.static('/uploads')
  const host = process.env.BASE_URL || `http://localhost:${ENV.PORT}`;
  const fileUrl = `${host}/uploads/${filename}`;

  return {
    url: fileUrl,
    filename,
    storage: 'local',
  };
}
