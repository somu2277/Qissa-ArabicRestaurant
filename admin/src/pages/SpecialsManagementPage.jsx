import React, { useEffect, useState } from 'react';
import {
  getAdminSpecials,
  getAdminMenuItems,
  createSpecial,
  updateSpecial,
  deleteSpecial,
} from '../services/adminApi';
import { Plus, Sparkles, Trash2, Edit2, Calendar, Clock, X } from 'lucide-react';

export const SpecialsManagementPage = () => {
  const [specials, setSpecials] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState(null);

  const [formData, setFormData] = useState({
    menuItemId: '',
    priority: 1,
    badgeText: "Today's Special",
    customPrice: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [specData, menuData] = await Promise.all([
        getAdminSpecials(),
        getAdminMenuItems(),
      ]);
      setSpecials(specData);
      setMenuItems(menuData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingSpecial(null);
    setFormData({
      menuItemId: menuItems[0]?._id || '',
      priority: specials.length + 1,
      badgeText: "Today's Special",
      customPrice: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this item from Today’s Specials?')) {
      try {
        await deleteSpecial(id);
        setSpecials((prev) => prev.filter((s) => s._id !== id));
      } catch (e) {
        alert('Failed to remove special');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        priority: parseInt(formData.priority, 10),
        customPrice: formData.customPrice ? parseFloat(formData.customPrice) : null,
      };

      if (editingSpecial) {
        const updated = await updateSpecial(editingSpecial._id, payload);
        setSpecials((prev) => prev.map((s) => (s._id === editingSpecial._id ? updated : s)));
      } else {
        const created = await createSpecial(payload);
        setSpecials((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Today's Specials Scheduler
          </h1>
          <p className="text-xs text-[#6B655D] mt-1">
            Promote dishes with highlighted badges, priority rankings, and special pricing.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#E8602C]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Feature a Dish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {specials.map((spec) => {
          const item = spec.menuItemId;
          if (!item) return null;

          return (
            <div
              key={spec._id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E9ECEF] shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                <img src={item.primaryImage} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#E8602C] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{spec.badgeText}</span>
                </div>
                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Priority #{spec.priority}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">{item.name}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-serif text-xl font-bold text-[#E8602C]">
                      ₹{spec.customPrice || item.price}
                    </span>
                    {spec.customPrice && spec.customPrice < item.price && (
                      <span className="text-xs text-[#6B655D] line-through">₹{item.price}</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E9ECEF] flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      spec.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {spec.isActive ? 'Active Now' : 'Paused'}
                  </span>

                  <button
                    onClick={() => handleDelete(spec._id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-serif font-bold text-lg">Feature a Dish</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Menu Item *</label>
                <select
                  required
                  value={formData.menuItemId}
                  onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                >
                  {menuItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} (₹{item.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  placeholder="Today's Special, Chef Highlight, 20% OFF"
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Special Price (Optional)</label>
                  <input
                    type="number"
                    value={formData.customPrice}
                    onChange={(e) => setFormData({ ...formData, customPrice: e.target.value })}
                    placeholder="Leave empty for base price"
                    className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Priority Ranking</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  Save Special
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
