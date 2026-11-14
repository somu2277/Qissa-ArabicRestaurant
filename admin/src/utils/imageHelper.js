export const DEFAULT_DISH_IMAGE =
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

export const resolveDishImage = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_DISH_IMAGE;
  }

  const trimmed = url.trim();

  // If already a base64 Data URL, use directly
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  // Determine active backend
  const isLocalClient =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const publicBackend =
    import.meta.env?.VITE_BACKEND_URL || 'https://qissa-backend.onrender.com';

  // If relative path like /uploads/dish_xxx
  if (trimmed.startsWith('/uploads/')) {
    const base = isLocalClient ? 'http://localhost:5000' : publicBackend;
    return `${base}${trimmed}`;
  }

  // If contains localhost:5000 and we are running in production
  if (trimmed.includes('localhost:5000') || trimmed.includes('127.0.0.1:5000')) {
    if (!isLocalClient) {
      return trimmed.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/g, publicBackend);
    }
  }

  return trimmed;
};

export const handleImageError = (e, fallback = DEFAULT_DISH_IMAGE) => {
  if (!e || !e.currentTarget) return;
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};
