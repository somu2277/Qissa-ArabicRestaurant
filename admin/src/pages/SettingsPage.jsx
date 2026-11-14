import React, { useEffect, useState } from 'react';
import { getAdminSettings, updateAdminSettings } from '../services/adminApi';
import { Save, Check, Sparkles, Bot, Store, Megaphone } from 'lucide-react';

export const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-xs text-[#6B655D]">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
          Restaurant Settings
        </h1>
        <p className="text-xs text-[#6B655D] mt-1">
          Control restaurant identity, announcement strip, and chatbot settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Brand Identity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9ECEF] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E9ECEF]">
            <Store className="w-5 h-5 text-[#E8602C]" />
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Brand Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#1A1A1A] mb-1">Restaurant Name</label>
              <input
                type="text"
                value={settings.name || ''}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A1A1A] mb-1">Arabic Name</label>
              <input
                type="text"
                value={settings.arabicName || ''}
                onChange={(e) => setSettings({ ...settings, arabicName: e.target.value })}
                className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl font-arabic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#1A1A1A] mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A1A1A] mb-1">Opening Hours</label>
              <input
                type="text"
                value={settings.openingHours || ''}
                onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1A1A1A] mb-1">Restaurant Address</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1A1A1A] mb-1">Hero Cover Image URL</label>
            <input
              type="url"
              value={settings.coverImage || ''}
              onChange={(e) => setSettings({ ...settings, coverImage: e.target.value })}
              className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
            />
          </div>
        </div>

        {/* 2. Top Announcement Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9ECEF] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#E8602C]" />
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Top Announcement Strip</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement?.isActive ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      isActive: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-[#E8602C] rounded"
              />
              <span className="font-bold text-xs">Enable Strip</span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-[#1A1A1A] mb-1">Announcement Message</label>
            <input
              type="text"
              value={settings.announcement?.text || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcement: {
                    ...settings.announcement,
                    text: e.target.value,
                  },
                })
              }
              placeholder="🎉 Today's Special: 20% OFF on all charcoal platters!"
              className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
            />
          </div>
        </div>

        {/* 3. Food Assistant Chatbot Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9ECEF] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#E8602C]" />
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Food Assistant (Chatbot)</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.chatbotSettings?.isEnabled ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    chatbotSettings: {
                      ...settings.chatbotSettings,
                      isEnabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-[#E8602C] rounded"
              />
              <span className="font-bold text-xs">Enable Chatbot</span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-[#1A1A1A] mb-1">Welcome Message</label>
            <textarea
              rows="2"
              value={settings.chatbotSettings?.welcomeMessage || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  chatbotSettings: {
                    ...settings.chatbotSettings,
                    welcomeMessage: e.target.value,
                  },
                })
              }
              className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1A1A1A] mb-1">Fallback Message</label>
            <textarea
              rows="2"
              value={settings.chatbotSettings?.fallbackMessage || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  chatbotSettings: {
                    ...settings.chatbotSettings,
                    fallbackMessage: e.target.value,
                  },
                })
              }
              className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {saved && (
            <span className="text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" />
              Settings saved & broadcasted in real-time!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#E8602C] hover:bg-[#D14E1E] text-white font-bold uppercase tracking-wider shadow-md shadow-[#E8602C]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
