import React, { useEffect, useState } from 'react';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryDishes,
  reorderCategories,
} from '../services/adminApi';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  Utensils,
  Image,
  AlertTriangle,
} from 'lucide-react';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    slug: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true,
  });

  // Category Dishes Modal
  const [selectedCatDishes, setSelectedCatDishes] = useState(null);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [dishesList, setDishesList] = useState([]);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const data = await getAdminCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openAdd = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      arabicName: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name || '',
      arabicName: cat.arabicName || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const viewDishes = async (cat) => {
    setSelectedCatDishes(cat);
    setDishesLoading(true);
    try {
      const dishes = await getCategoryDishes(cat._id);
      setDishesList(dishes);
    } catch (err) {
      console.error(err);
      setDishesList([]);
    } finally {
      setDishesLoading(false);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    // Re-assign sortOrder
    const reordered = newCats.map((cat, idx) => ({
      ...cat,
      sortOrder: idx + 1,
    }));
    setCategories(reordered);

    try {
      const payload = reordered.map((c) => ({ id: c._id, sortOrder: c.sortOrder }));
      await reorderCategories(payload);
    } catch (err) {
      console.error('Failed to save reorder', err);
      fetchCats();
    }
  };

  const handleDelete = async (cat) => {
    if (cat.dishCount > 0) {
      alert(
        `Cannot delete "${cat.name}": ${cat.dishCount} dish(es) are currently assigned to this category. Please reassign or delete them first in Menu Management.`
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        await deleteCategory(cat._id);
        setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        slug:
          formData.slug ||
          formData.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-'),
      };

      if (editingCat) {
        const updated = await updateCategory(editingCat._id, payload);
        setCategories((prev) =>
          prev.map((c) => (c._id === editingCat._id ? { ...c, ...updated } : c))
        );
      } else {
        const created = await createCategory(payload);
        setCategories((prev) => [...prev, { ...created, dishCount: 0 }]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Categories Management
          </h1>
          <p className="text-xs text-[#6B655D] mt-1">
            Organize image cards, section titles, dish counts and navigation display order.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#E8602C]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-[#E8602C] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[#6B655D]">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => (
            <div
              key={cat._id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E9ECEF] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Category Cover Image with Order Badge */}
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  #{cat.sortOrder || idx + 1}
                </div>

                {/* Reorder Buttons */}
                <div className="absolute top-3 left-3 flex gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="w-7 h-7 rounded-full bg-white/90 text-gray-700 hover:text-[#E8602C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                    title="Move Category Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="w-7 h-7 rounded-full bg-white/90 text-gray-700 hover:text-[#E8602C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                    title="Move Category Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-serif font-bold text-base text-[#1A1A1A]">{cat.name}</h3>
                    {cat.arabicName && (
                      <span className="font-arabic text-xs text-[#C9953C]">{cat.arabicName}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B655D] line-clamp-2 mt-1">{cat.description}</p>
                </div>

                {/* Dish Count & View Dishes Button */}
                <div className="mt-4 pt-3 border-t border-[#F1F3F5] flex items-center justify-between">
                  <button
                    onClick={() => viewDishes(cat)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8602C] hover:text-[#D14E1E] transition-colors"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{cat.dishCount ?? 0} dishes assigned</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>

                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-[#6B655D] hover:text-[#E8602C] rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-[#6B655D] hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF] mb-4">
              <h3 className="font-serif font-bold text-lg">
                {editingCat ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                  placeholder="e.g. Soups"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Arabic Name</label>
                <input
                  type="text"
                  value={formData.arabicName}
                  onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl font-arabic"
                  placeholder="شوربة"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Cover Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                  placeholder="Warm, comforting and full of flavor."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Status</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.value === 'true' })
                    }
                    className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E8602C] text-white font-bold rounded-xl"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Assigned Dishes Modal */}
      {selectedCatDishes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                  Dishes in {selectedCatDishes.name}
                </h3>
                <p className="text-xs text-[#6B655D]">
                  {dishesList.length} dish(es) currently assigned to this category
                </p>
              </div>
              <button
                onClick={() => setSelectedCatDishes(null)}
                className="p-1 rounded-lg text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {dishesLoading ? (
                <div className="py-12 text-center text-xs text-gray-500">Loading dishes...</div>
              ) : dishesList.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500">
                  No dishes currently assigned to this category.
                </div>
              ) : (
                dishesList.map((dish) => (
                  <div
                    key={dish._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={dish.primaryImage}
                        alt={dish.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#1A1A1A]">{dish.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              dish.isVeg
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {dish.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">₹{dish.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dish.isAvailable !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {dish.isAvailable !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#E9ECEF] flex justify-end">
              <button
                onClick={() => setSelectedCatDishes(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
