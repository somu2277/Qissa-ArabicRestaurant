import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/admin';

const adminApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Interceptor to inject JWT token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('qissa_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginAdmin = async (credentials) => {
  const res = await adminApi.post('/auth/login', credentials);
  return res.data;
};

export const getMe = async () => {
  const res = await adminApi.get('/auth/me');
  return res.data.admin;
};

// Dashboard
export const getDashboardStats = async () => {
  const res = await adminApi.get('/dashboard');
  return res.data.data;
};

// Menu Management
export const getAdminMenuItems = async () => {
  const res = await adminApi.get('/menu');
  return res.data.data;
};

export const createMenuItem = async (data) => {
  const res = await adminApi.post('/menu', data);
  return res.data.data;
};

export const updateMenuItem = async (id, data) => {
  const res = await adminApi.put(`/menu/${id}`, data);
  return res.data.data;
};

export const deleteMenuItem = async (id) => {
  const res = await adminApi.delete(`/menu/${id}`);
  return res.data;
};

// Image Uploads & Automatic Arabic Translation
export const uploadDishImage = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await adminApi.post('/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return res.data;
};

export const uploadMultipleDishImages = async (files, onUploadProgress) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });
  const res = await adminApi.post('/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return res.data;
};

export const translateDishName = async (text) => {
  const res = await adminApi.post('/translate', { text });
  return res.data;
};

// Categories
export const getAdminCategories = async () => {
  const res = await adminApi.get('/categories');
  return res.data.data;
};

export const createCategory = async (data) => {
  const res = await adminApi.post('/categories', data);
  return res.data.data;
};

export const updateCategory = async (id, data) => {
  const res = await adminApi.put(`/categories/${id}`, data);
  return res.data.data;
};

export const deleteCategory = async (id) => {
  const res = await adminApi.delete(`/categories/${id}`);
  return res.data;
};

export const getCategoryDishes = async (categoryId) => {
  const res = await adminApi.get(`/categories/${categoryId}/dishes`);
  return res.data.data;
};

export const reorderCategories = async (items) => {
  const res = await adminApi.put('/categories/reorder', { items });
  return res.data;
};

// Tables & QR
export const getAdminTables = async () => {
  const res = await adminApi.get('/tables');
  return res.data.data;
};

export const createTable = async (data) => {
  const res = await adminApi.post('/tables', data);
  return res.data.data;
};

export const updateTable = async (id, data) => {
  const res = await adminApi.put(`/tables/${id}`, data);
  return res.data.data;
};

export const regenerateTableQR = async (id) => {
  const res = await adminApi.post(`/tables/${id}/regenerate-qr`);
  return res.data;
};

export const refreshTableQRImage = async (id) => {
  const res = await adminApi.post(`/tables/${id}/refresh-qr`);
  return res.data;
};

export const syncAllTableQRs = async () => {
  const res = await adminApi.post('/tables/sync-public-urls');
  return res.data;
};

export const deleteTable = async (id) => {
  const res = await adminApi.delete(`/tables/${id}`);
  return res.data;
};

// Specials
export const getAdminSpecials = async () => {
  const res = await adminApi.get('/specials');
  return res.data.data;
};

export const createSpecial = async (data) => {
  const res = await adminApi.post('/specials', data);
  return res.data.data;
};

export const updateSpecial = async (id, data) => {
  const res = await adminApi.put(`/specials/${id}`, data);
  return res.data.data;
};

export const deleteSpecial = async (id) => {
  const res = await adminApi.delete(`/specials/${id}`);
  return res.data;
};

// Settings
export const getAdminSettings = async () => {
  const res = await adminApi.get('/settings');
  return res.data.data;
};

export const updateAdminSettings = async (data) => {
  const res = await adminApi.put('/settings', data);
  return res.data.data;
};

// Ratings Management
export const getAdminRatingStats = async () => {
  const res = await adminApi.get('/ratings/stats');
  return res.data.data;
};

export const getAdminRatings = async (page = 1, limit = 20) => {
  const res = await adminApi.get(`/ratings?page=${page}&limit=${limit}`);
  return res.data;
};

export const updateAdminRatingSettings = async (data) => {
  const res = await adminApi.put('/ratings/settings', data);
  return res.data;
};

// Activity Logs
export const getActivityLogs = async () => {
  const res = await adminApi.get('/activity');
  return res.data.data;
};

export default adminApi;
