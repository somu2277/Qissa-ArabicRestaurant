import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
  getRestaurantInfo,
  getCategories,
  getMenuItems,
  getSpecials,
  getPopularDishes,
} from '../services/api';

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [currentTable, setCurrentTable] = useState(() => {
    try {
      const saved = sessionStorage.getItem('qissa_active_table');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [tableSessionToken, setTableSessionToken] = useState(() => {
    return sessionStorage.getItem('qissa_table_session_token') || null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Category (for Category Navigation bar & Scroll Spy tracking) - Default to 'all'
  const [activeCategory, setActiveCategory] = useState('all');

  // Filters & Search - Default dietary filter is 'all'
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [availableOnly, setAvailableOnly] = useState(false); // boolean
  const [searchQuery, setSearchQuery] = useState('');

  // Selected dish for Food Detail Modal
  const [selectedDish, setSelectedDish] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [restData, catData, menuData, specData, popData] = await Promise.all([
        getRestaurantInfo(),
        getCategories(),
        getMenuItems(),
        getSpecials(),
        getPopularDishes(),
      ]);

      setRestaurant(restData);
      setCategories(catData);
      setMenuItems(menuData);
      setSpecials(specData);
      setPopularDishes(popData);
      // Requirement: "All Categories" is the default; do not automatically select the first category.
      if (!activeCategory) {
        setActiveCategory('all');
      }
      setError(null);
    } catch (err) {
      console.error('[MenuContext] Error fetching data:', err);
      setError('Unable to load menu. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchAllData();

    // Initialize Socket.IO for real-time menu, category & price updates
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time menu stream.');
    });

    socket.on('menu:updated', (payload) => {
      console.log('[Socket.IO] Real-time menu update received:', payload);
      getMenuItems().then(setMenuItems).catch(console.error);
      getPopularDishes().then(setPopularDishes).catch(console.error);
      getCategories().then(setCategories).catch(console.error);
    });

    socket.on('availability:updated', ({ itemId, isAvailable }) => {
      console.log(`[Socket.IO] Item ${itemId} availability changed to ${isAvailable}`);
      setMenuItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, isAvailable } : item))
      );
    });

    socket.on('category:updated', () => {
      console.log('[Socket.IO] Real-time category update received');
      getCategories().then(setCategories).catch(console.error);
      getMenuItems().then(setMenuItems).catch(console.error);
    });

    socket.on('specials:updated', () => {
      getSpecials().then(setSpecials).catch(console.error);
    });

    socket.on('settings:updated', (newRest) => {
      setRestaurant(newRest);
    });

    socket.on('dish:rating_updated', ({ menuItemId, averageRating, totalRatings, ratingDistribution }) => {
      console.log(`[Socket.IO] Dish rating updated: ${menuItemId} -> ${averageRating}★ (${totalRatings})`);
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === menuItemId
            ? { ...item, averageRating, totalRatings, ratingDistribution }
            : item
        )
      );
      setPopularDishes((prev) =>
        prev.map((item) =>
          item._id === menuItemId
            ? { ...item, averageRating, totalRatings, ratingDistribution }
            : item
        )
      );
      setSelectedDish((prev) =>
        prev && prev._id === menuItemId
          ? { ...prev, averageRating, totalRatings, ratingDistribution }
          : prev
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAllData]);

  const updateDishRatingLocally = (menuItemId, stats) => {
    setMenuItems((prev) =>
      prev.map((item) => (item._id === menuItemId ? { ...item, ...stats } : item))
    );
    setPopularDishes((prev) =>
      prev.map((item) => (item._id === menuItemId ? { ...item, ...stats } : item))
    );
    setSelectedDish((prev) =>
      prev && prev._id === menuItemId ? { ...prev, ...stats } : prev
    );
  };

  // Filtered menu items (Dietary, Availability, and Search - keeps all categories!)
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Dietary filter
      if (dietaryFilter === 'veg' && !item.isVeg) return false;
      if (dietaryFilter === 'non-veg' && item.isVeg) return false;

      // 2. Availability filter
      if (availableOnly && item.isAvailable === false) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(q);
        const arabicMatch = (item.arabicName || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const tagMatch = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!nameMatch && !arabicMatch && !descMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [menuItems, dietaryFilter, availableOnly, searchQuery]);

  // Compute live dish count per category under current dietary & availability filters
  const dishCountsByCategory = useMemo(() => {
    const counts = {};
    let totalAll = 0;
    categories.forEach((cat) => {
      const count = menuItems.filter((item) => {
        const itemCatId = item.categoryId?._id || item.categoryId;
        if (itemCatId?.toString() !== cat._id?.toString()) return false;
        if (dietaryFilter === 'veg' && !item.isVeg) return false;
        if (dietaryFilter === 'non-veg' && item.isVeg) return false;
        if (availableOnly && item.isAvailable === false) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = item.name.toLowerCase().includes(q);
          const arabicMatch = (item.arabicName || '').toLowerCase().includes(q);
          const descMatch = (item.description || '').toLowerCase().includes(q);
          const tagMatch = (item.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!nameMatch && !arabicMatch && !descMatch && !tagMatch) return false;
        }
        return true;
      }).length;
      counts[cat._id] = count;
      totalAll += count;
    });
    counts['all'] = totalAll;
    return counts;
  }, [categories, menuItems, dietaryFilter, availableOnly, searchQuery]);

  // Select a category and smoothly navigate to menu view without breaking global dietary filter
  const selectCategory = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    requestAnimationFrame(() => {
      const target =
        categoryId === 'all'
          ? document.getElementById('menu-header') ||
            document.getElementById('menu-section') ||
            document.getElementById('explore-categories')
          : document.getElementById(`category-${categoryId}`);

      if (target) {
        const stickyBar = document.getElementById('sticky-category-bar');
        const stickyHeight = stickyBar ? stickyBar.offsetHeight : 86;
        const navHeight = window.innerWidth >= 640 ? 64 : 56;
        const navOffset = navHeight + stickyHeight + 16;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }
    });
  }, []);

  return (
    <MenuContext.Provider
      value={{
        restaurant,
        categories,
        menuItems,
        filteredItems,
        specials,
        popularDishes,
        currentTable,
        setCurrentTable,
        tableSessionToken,
        setTableSessionToken,
        updateDishRatingLocally,
        loading,
        error,
        activeCategory,
        setActiveCategory,
        selectedCategory: activeCategory, // backwards-compatible alias
        setSelectedCategory: selectCategory,
        selectCategory,
        scrollToCategory: selectCategory, // backwards-compatible alias
        dietaryFilter,
        setDietaryFilter,
        availableOnly,
        setAvailableOnly,
        searchQuery,
        setSearchQuery,
        selectedDish,
        setSelectedDish,
        dishCountsByCategory,
        refreshMenu: fetchAllData,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
};
