import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/public';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const getRestaurantInfo = async () => {
  const res = await api.get('/restaurant');
  return res.data.data;
};

export const getTableDetails = async (qrToken) => {
  const res = await api.get(`/tables/${qrToken}`);
  return res.data.data;
};

export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data.data;
};

export const getMenuItems = async (params = {}) => {
  const res = await api.get('/menu', { params });
  return res.data.data;
};

export const getMenuItemById = async (id) => {
  const res = await api.get(`/menu/${id}`);
  return res.data.data;
};

export const getRelatedDishes = async (itemId, params = {}) => {
  const res = await api.get(`/menu/${itemId}/related`, { params });
  return res.data.data;
};

export const getSpecials = async () => {
  const res = await api.get('/specials');
  return res.data.data;
};

export const getPopularDishes = async () => {
  const res = await api.get('/popular');
  return res.data.data;
};

export const sendAssistantMessage = async (message, options = {}) => {
  const res = await api.post('/assistant/message', {
    message,
    ...options,
  });
  return res.data.data;
};

export const resetAssistantSession = async (sessionId) => {
  const res = await api.post('/assistant/reset', { sessionId });
  return res.data.data;
};

export const getDishRatings = async (itemId) => {
  const sessionToken = sessionStorage.getItem('qissa_table_session_token');
  const headers = sessionToken ? { 'x-table-session': sessionToken } : {};
  const res = await api.get(`/menu/${itemId}/ratings`, { headers });
  return res.data.data;
};

export const submitDishRating = async (itemId, rating) => {
  const sessionToken = sessionStorage.getItem('qissa_table_session_token');
  const headers = sessionToken ? { 'x-table-session': sessionToken } : {};
  const res = await api.post(`/menu/${itemId}/ratings`, { rating }, { headers });
  return res.data;
};

export const trackInteraction = async (payload) => {
  try {
    await api.post('/interactions', payload);
  } catch (e) {
    // silently ignore tracking errors
  }
};

export default api;
