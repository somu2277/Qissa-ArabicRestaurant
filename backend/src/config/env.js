import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in backend directory, or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PRODUCTION_CUSTOMER_URL = 'https://qissa-arabic-restaurant.vercel.app';
const PRODUCTION_ADMIN_URL = 'https://qissa-admin-dashboard.vercel.app';
const PRODUCTION_BACKEND_URL = 'https://qissa-backend.onrender.com';

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'qissa_super_secret_jwt_key_2026_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PUBLIC_MENU_URL: process.env.PUBLIC_MENU_URL || process.env.CLIENT_CUSTOMER_URL || PRODUCTION_CUSTOMER_URL,
  CLIENT_CUSTOMER_URL: process.env.CLIENT_CUSTOMER_URL || process.env.PUBLIC_MENU_URL || PRODUCTION_CUSTOMER_URL,
  CLIENT_ADMIN_URL: process.env.CLIENT_ADMIN_URL || process.env.ADMIN_URL || PRODUCTION_ADMIN_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

/**
 * Resolves the public customer menu URL for QR codes.
 * Rejects localhost/127.0.0.1 in production mode and ensures any production QR
 * code opens on real customer smartphones scanning it anywhere.
 */
export const getPublicCustomerMenuUrl = () => {
  const configured = (ENV.PUBLIC_MENU_URL || ENV.CLIENT_CUSTOMER_URL || '').trim();
  const isLocal =
    !configured ||
    configured.includes('localhost') ||
    configured.includes('127.0.0.1') ||
    configured.includes('192.168.') ||
    configured.includes('10.0.') ||
    configured.includes('172.16.');

  if (ENV.NODE_ENV === 'production' || isLocal) {
    if (configured && !isLocal) {
      return configured.replace(/\/$/, '');
    }
    return PRODUCTION_CUSTOMER_URL;
  }

  return configured ? configured.replace(/\/$/, '') : PRODUCTION_CUSTOMER_URL;
};

/**
 * Constructs the canonical public customer menu route for a dining table.
 * e.g. https://qissa-arabic-restaurant.vercel.app/menu/{tableToken}
 */
export const constructTableMenuUrl = (tableToken) => {
  const base = getPublicCustomerMenuUrl();
  return `${base}/menu/${tableToken}`;
};

/**
 * Resolves the public backend URL for asset serving and uploads.
 * Rejects localhost/127.0.0.1 in production mode so images are universally reachable.
 */
export const getPublicBackendUrl = () => {
  const configured = (process.env.BACKEND_URL || process.env.BASE_URL || '').trim();
  const isLocal =
    !configured ||
    configured.includes('localhost') ||
    configured.includes('127.0.0.1') ||
    configured.includes('192.168.') ||
    configured.includes('10.0.') ||
    configured.includes('172.16.');

  if (ENV.NODE_ENV === 'production' || isLocal) {
    if (configured && !isLocal) {
      return configured.replace(/\/$/, '');
    }
    return PRODUCTION_BACKEND_URL;
  }

  return configured ? configured.replace(/\/$/, '') : PRODUCTION_BACKEND_URL;
};
