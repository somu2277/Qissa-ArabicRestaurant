import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  getAdminMenuItems,
  getAdminCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  translateDishName,
} from '../services/adminApi';
import { DishImageUploader } from '../components/menu/DishImageUploader';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Languages,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Utensils,
  Layers,
  Sliders,
  ShieldCheck,
  Tag,
} from 'lucide-react';

export const MenuManagementPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSource, setTranslationSource] = useState(null); // 'dictionary' | 'api' | null
  const [isManuallyEditedArabic, setIsManuallyEditedArabic] = useState(false);
  const translationTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    categoryId: '',
    price: '',
    isVeg: false,
    description: '',
    primaryImage: '',
    images: [],
    badges: [],
    tags: '',
    ingredients: '',
    allergens: '',
    flavours: [],
    preparationMethods: [],
    characteristics: [],
    mealRole: 'main',
    isActive: true,
    isAvailable: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuData, catData] = await Promise.all([
        getAdminMenuItems(),
        getAdminCategories(),
      ]);
      setItems(menuData);
      setCategories(catData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Automatic Arabic translation function
  const handleAutoTranslate = useCallback(async (dishName, force = false) => {
    if (!dishName || dishName.trim().length < 2) return;
    setIsTranslating(true);
    try {
      const res = await translateDishName(dishName.trim());
      if (res.data?.arabicName) {
        setFormData((prev) => {
          // If not forced and user has manually edited, do not overwrite
          if (!force && isManuallyEditedArabic && prev.arabicName) {
            return prev;
          }
          return {
            ...prev,
            arabicName: res.data.arabicName,
          };
        });
        setTranslationSource(res.data.source || 'api');
      }
    } catch (err) {
      console.warn('Auto-translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [isManuallyEditedArabic]);

  // Debounced translation trigger on English name change
  const handleNameChange = (newName) => {
    setFormData((prev) => ({ ...prev, name: newName }));

    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    if (!isManuallyEditedArabic && newName.trim().length >= 3) {
      translationTimeoutRef.current = setTimeout(() => {
        handleAutoTranslate(newName, false);
      }, 600);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsManuallyEditedArabic(false);
    setTranslationSource(null);
    setFormError(null);
    setFormData({
      name: '',
      arabicName: '',
      categoryId: categories[0]?._id || '',
      price: '',
      isVeg: false,
      description: '',
      primaryImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
      badges: [],
      tags: '',
      ingredients: '',
      allergens: '',
      flavours: [],
      preparationMethods: [],
      characteristics: [],
      mealRole: 'main',
      isActive: true,
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsManuallyEditedArabic(true); // Preserve existing Arabic name on edit
    setTranslationSource(null);
    setFormError(null);
    setFormData({
      name: item.name || '',
      arabicName: item.arabicName || '',
      categoryId: item.categoryId?._id || item.categoryId || '',
      price: item.price !== undefined ? item.price : '',
      isVeg: !!item.isVeg,
      description: item.description || '',
      primaryImage: item.primaryImage || '',
      images: item.images && item.images.length > 0 ? item.images : [item.primaryImage].filter(Boolean),
      badges: item.badges || [],
      tags: (item.tags || []).join(', '),
      ingredients: (item.ingredients || []).join(', '),
      allergens: (item.allergens || []).join(', '),
      flavours: item.flavours || [],
      preparationMethods: item.preparationMethods || [],
      characteristics: item.characteristics || [],
      mealRole: item.mealRole || 'main',
      isActive: item.isActive !== false,
      isAvailable: item.isAvailable !== false,
    });
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updated = await updateMenuItem(item._id, {
        isAvailable: !item.isAvailable,
      });
      setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMenuItem(id);
        setItems((prev) => prev.filter((i) => i._id !== id));
      } catch (err) {
        alert('Failed to delete item.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter a dish name.');
      return;
    }
    if (!formData.primaryImage) {
      setFormError('Please upload at least one primary food photograph.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ingredients: formData.ingredients.split(',').map((t) => t.trim()).filter(Boolean),
        allergens: formData.allergens.split(',').map((t) => t.trim()).filter(Boolean),
        images: formData.images && formData.images.length > 0 ? formData.images : [formData.primaryImage],
      };

      if (editingItem) {
        const updated = await updateMenuItem(editingItem._id, payload);
        setItems((prev) => prev.map((i) => (i._id === editingItem._id ? updated : i)));
      } else {
        const created = await createMenuItem(payload);
        setItems((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((i) => {
    const matchCat = selectedCat === 'all' || (i.categoryId?._id || i.categoryId) === selectedCat;
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.arabicName || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.description || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Menu Management
          </h1>
          <p className="text-xs text-[#6B655D] mt-1">
            Add dishes, upload photographs directly, auto-translate Arabic names, and manage menu items.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#E8602C]/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E9ECEF] flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B655D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by English or Arabic name..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-xs text-[#1A1A1A] outline-none focus:border-[#E8602C]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#E8602C]"
          >
            <option value="all">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-3xl border border-[#E9ECEF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A1A1A]">
            <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[#6B655D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Diet</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.primaryImage}
                        alt={item.name}
                        className="w-12 h-10 object-cover rounded-xl bg-gray-100 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[#1A1A1A] block">{item.name}</span>
                        {item.arabicName && (
                          <span className="text-[11px] text-[#C9953C] font-arabic block font-medium" dir="rtl">
                            {item.arabicName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[#6B655D] font-medium">
                    {item.categoryId?.name || 'Uncategorized'}
                  </td>

                  <td className="py-3 px-4 font-serif font-bold text-sm text-[#E8602C]">
                    ₹{item.price}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        item.isVeg
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(item.badges || []).map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {b.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-[#6B655D] hover:text-[#E8602C] hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        className="p-1.5 text-[#6B655D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          UPGRADED FOOD ITEM MODAL: Direct Upload & Auto Arabic
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#EAE3D6] flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <p className="text-[11px] text-[#6B655D]">
                  Direct image upload with Cloudinary and automatic Arabic translation
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Close form? Any unsaved changes will be lost.')) {
                    setIsModalOpen(false);
                  }
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#6B655D] hover:text-[#1A1A1A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Notification */}
            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs flex-1">
              {/* ────────────────────────────────────────────────────────
                  SECTION A: BASIC INFORMATION
                  ──────────────────────────────────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F2EBE0]">
                  <Utensils className="w-4 h-4 text-[#E8602C]" />
                  <h3 className="font-serif font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">
                    Section A — Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* English Dish Name */}
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      English Dish Name <span className="text-[#E8602C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chicken Mandi, Moroccan Harira..."
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF6F0] border border-[#EAE3D6] rounded-xl outline-none focus:border-[#E8602C] focus:bg-white text-[#1A1A1A] font-semibold transition-all"
                    />
                  </div>

                  {/* Arabic Dish Name with Automatic Translation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                        <span>Arabic Dish Name</span>
                        {translationSource && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-orange-100 text-[#E8602C] flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Auto-translated</span>
                          </span>
                        )}
                      </label>

                      <button
                        type="button"
                        onClick={() => handleAutoTranslate(formData.name, true)}
                        disabled={isTranslating || !formData.name.trim()}
                        className="text-[11px] font-bold text-[#E8602C] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Force translate English name to Arabic"
                      >
                        <Languages className="w-3 h-3" />
                        <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="اسم الطبق بالعربية..."
                        value={formData.arabicName}
                        onChange={(e) => {
                          setIsManuallyEditedArabic(true);
                          setFormData({ ...formData, arabicName: e.target.value });
                        }}
                        className="w-full p-2.5 bg-[#FAF6F0] border border-[#EAE3D6] rounded-xl outline-none focus:border-[#E8602C] focus:bg-white text-[#C9953C] font-arabic font-bold text-sm tracking-wide text-right transition-all"
                      />
                      {isTranslating && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[#E8602C] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8602C] animate-ping" />
                          <span>Translating...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Category <span className="text-[#E8602C]">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF6F0] border border-[#EAE3D6] rounded-xl outline-none focus:border-[#E8602C] font-semibold text-[#1A1A1A]"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Price (₹) <span className="text-[#E8602C]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      placeholder="e.g. 299"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF6F0] border border-[#EAE3D6] rounded-xl outline-none focus:border-[#E8602C] font-serif font-bold text-[#1A1A1A]"
                    />
                  </div>

                  {/* Diet Classification */}
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">Diet Classification</label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="dietRadio"
                          checked={!formData.isVeg}
                          onChange={() => setFormData({ ...formData, isVeg: false })}
                          className="accent-[#E8602C]"
                        />
                        <span className="font-bold text-rose-600">Non-Veg 🍗</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="dietRadio"
                          checked={formData.isVeg}
                          onChange={() => setFormData({ ...formData, isVeg: true })}
                          className="accent-emerald-600"
                        />
                        <span className="font-bold text-emerald-600">Pure Veg 🌱</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Full Description</label>
                  <textarea
                    rows="2.5"
                    placeholder="Describe authentic spices, preparation, and culinary experience..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EAE3D6] rounded-xl outline-none focus:border-[#E8602C] focus:bg-white text-[#1A1A1A] leading-relaxed transition-all"
                  />
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  SECTION B: FOOD PHOTOGRAPHS (DIRECT UPLOAD)
                  ──────────────────────────────────────────────────────── */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F2EBE0]">
                  <Layers className="w-4 h-4 text-[#E8602C]" />
                  <h3 className="font-serif font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">
                    Section B — Food Photographs (Direct Upload & Cloudinary)
                  </h3>
                </div>

                <DishImageUploader
                  primaryImage={formData.primaryImage}
                  images={formData.images}
                  onChangePrimary={(url) => setFormData((prev) => ({ ...prev, primaryImage: url }))}
                  onChangeImages={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
                />
              </div>

              {/* ────────────────────────────────────────────────────────
                  SECTION C: AI FOOD ASSISTANT ATTRIBUTES
                  ──────────────────────────────────────────────────────── */}
              <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#EAE3D6] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E0D7C9]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#E8602C]" />
                    <h4 className="font-serif font-bold text-xs text-[#E8602C] uppercase tracking-wider">
                      Section C — AI Food Assistant Attributes
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#8C8275]">
                    Powers conversational recommendations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">Meal Role</label>
                    <select
                      value={formData.mealRole}
                      onChange={(e) => setFormData({ ...formData, mealRole: e.target.value })}
                      className="w-full p-2 bg-white border border-[#E0D7C9] rounded-xl outline-none focus:border-[#E8602C] font-semibold text-[#1A1A1A]"
                    >
                      <option value="main">Main Course</option>
                      <option value="starter">Starter / Mezze</option>
                      <option value="snack">Snack / Quick Bite</option>
                      <option value="dessert">Dessert</option>
                      <option value="beverage">Beverage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Ingredients (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      placeholder="Chicken, Basmati Rice, Cardamom, Garlic"
                      className="w-full p-2 bg-white border border-[#E0D7C9] rounded-xl outline-none focus:border-[#E8602C] text-[#1A1A1A]"
                    />
                  </div>
                </div>

                {/* Flavours Chips */}
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Flavours</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['spicy', 'mild', 'creamy', 'smoky', 'tangy', 'sweet'].map((flav) => {
                      const active = formData.flavours?.includes(flav);
                      return (
                        <button
                          key={flav}
                          type="button"
                          onClick={() => {
                            const current = formData.flavours || [];
                            setFormData({
                              ...formData,
                              flavours: active
                                ? current.filter((f) => f !== flav)
                                : [...current, flav],
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                            active
                              ? 'bg-[#E8602C] text-white shadow-2xs'
                              : 'bg-white text-[#1A1A1A] border border-[#E0D7C9] hover:border-[#E8602C]'
                          }`}
                        >
                          {flav}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preparation Methods Chips */}
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Preparation Methods</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['grilled', 'fried', 'baked', 'roasted', 'slow-cooked'].map((prep) => {
                      const active = formData.preparationMethods?.includes(prep);
                      return (
                        <button
                          key={prep}
                          type="button"
                          onClick={() => {
                            const current = formData.preparationMethods || [];
                            setFormData({
                              ...formData,
                              preparationMethods: active
                                ? current.filter((p) => p !== prep)
                                : [...current, prep],
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                            active
                              ? 'bg-[#1A1A1A] text-white shadow-2xs'
                              : 'bg-white text-[#1A1A1A] border border-[#E0D7C9] hover:border-[#1A1A1A]'
                          }`}
                        >
                          {prep}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Characteristics Chips */}
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Characteristics</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['light', 'healthy', 'rich', 'filling'].map((ch) => {
                      const active = formData.characteristics?.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            const current = formData.characteristics || [];
                            setFormData({
                              ...formData,
                              characteristics: active
                                ? current.filter((c) => c !== ch)
                                : [...current, ch],
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                            active
                              ? 'bg-[#C9953C] text-white shadow-2xs'
                              : 'bg-white text-[#1A1A1A] border border-[#E0D7C9] hover:border-[#C9953C]'
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Recommendation Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="spicy, grilled, chicken, smoky"
                      className="w-full p-2 bg-white border border-[#E0D7C9] rounded-xl outline-none focus:border-[#E8602C] text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Known Allergens (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.allergens}
                      onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                      placeholder="Gluten, Dairy, Nuts, Sesame"
                      className="w-full p-2 bg-white border border-[#E0D7C9] rounded-xl outline-none focus:border-[#E8602C] text-[#1A1A1A]"
                    />
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────
                  SECTION D & E: BADGES & AVAILABILITY
                  ──────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Badges */}
                <div className="p-4 bg-white rounded-2xl border border-[#EAE3D6] space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-[#F2EBE0]">
                    <Tag className="w-3.5 h-3.5 text-[#E8602C]" />
                    <label className="font-bold text-[#1A1A1A]">Section D — Badges</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {['bestseller', 'chef_choice', 'new', 'popular'].map((badge) => {
                      const isChecked = formData.badges.includes(badge);
                      return (
                        <label key={badge} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, badges: [...formData.badges, badge] });
                              } else {
                                setFormData({
                                  ...formData,
                                  badges: formData.badges.filter((b) => b !== badge),
                                });
                              }
                            }}
                            className="accent-[#E8602C]"
                          />
                          <span className="capitalize font-semibold text-[#1A1A1A]">
                            {badge.replace('_', ' ')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Availability & Active Status */}
                <div className="p-4 bg-white rounded-2xl border border-[#EAE3D6] space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-[#F2EBE0]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E8602C]" />
                    <label className="font-bold text-[#1A1A1A]">Section E — Availability</label>
                  </div>
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between cursor-pointer select-none p-1.5 rounded-xl hover:bg-[#FAF6F0]">
                      <div>
                        <span className="font-semibold text-[#1A1A1A] block">Kitchen Availability</span>
                        <span className="text-[10px] text-[#6B655D]">Toggle if item is in stock today</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        className="w-4 h-4 accent-[#E8602C]"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer select-none p-1.5 rounded-xl hover:bg-[#FAF6F0]">
                      <div>
                        <span className="font-semibold text-[#1A1A1A] block">Published on Menu</span>
                        <span className="text-[10px] text-[#6B655D]">Active on public customer portal</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 accent-[#E8602C]"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Buttons */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-4 pb-2 border-t border-[#EAE3D6] flex items-center justify-end gap-3 z-20">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Close form? Any unsaved changes will be lost.')) {
                      setIsModalOpen(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-[#EAE3D6] hover:bg-gray-100 text-[#1A1A1A] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-[#E8602C] hover:bg-[#D14E1E] disabled:opacity-50 text-white font-bold uppercase tracking-wider shadow-md shadow-[#E8602C]/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving Dish...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Dish' : 'Save Dish'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
