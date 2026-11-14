import React, { useState, useRef, useEffect } from 'react';
import { useMenu } from '../../context/MenuContext';
import { sendAssistantMessage, resetAssistantSession } from '../../services/api';
import { resolveDishImage, handleImageError } from '../../utils/imageHelper';
import {
  ArrowLeft,
  Bot,
  MoreVertical,
  Plus,
  Send,
  Mic,
  Star,
  Heart,
  RotateCcw,
  Sparkles,
  X,
  Flame,
  Salad,
  Cake,
  Utensils,
  CookingPot,
} from 'lucide-react';

export const FoodAssistant = ({ isOpenExternal, onCloseExternal, onOpenExternal }) => {
  const {
    restaurant,
    setSelectedDish,
    assistantOpen,
    setAssistantOpen,
    assistantInitialQuery,
    setAssistantInitialQuery,
  } = useMenu();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = assistantOpen || (isOpenExternal !== undefined ? isOpenExternal : internalOpen);

  const setIsOpen = (val) => {
    if (setAssistantOpen) setAssistantOpen(val);
    setInternalOpen(val);
    if (val && onOpenExternal) onOpenExternal();
    if (!val && onCloseExternal) onCloseExternal();
  };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePreferences, setActivePreferences] = useState({});
  const [showMenuOptions, setShowMenuOptions] = useState(false);

  const suggestionChips = [
    { label: 'Something spicy', icon: '🔥', query: 'I want something spicy' },
    { label: 'Light & fresh', icon: '🥗', query: 'Show light and fresh salads or mezzes' },
    { label: 'Grilled specials', icon: '🍗', query: 'Show me grilled meat specials and kebabs' },
    { label: 'Rice dishes', icon: '🍚', query: 'I want authentic Arabic rice dishes or Mandi' },
    { label: 'Desserts', icon: '🍰', query: 'What desserts do you have?' },
    { label: "Chef's recommendations", icon: '✨', query: "What are the chef's top recommendations?" },
  ];

  const messagesEndRef = useRef(null);

  // Persistent session ID
  const getSessionId = () => {
    let id = sessionStorage.getItem('qissa_assistant_session_id');
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('qissa_assistant_session_id', id);
    }
    return id;
  };

  // Initialize welcome conversation matching Screen 4
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text:
            restaurant?.chatbotSettings?.welcomeMessage ||
            "Hi! I'm your Food Assistant. I can help you discover dishes, suggest meals, or find something based on your taste.",
          showChips: true,
          dishes: [],
        },
      ]);
    }
  }, [isOpen, messages.length, restaurant]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Listen for external trigger queries (e.g. from FoodDetailModal "Ask Assistant for Similar Dishes")
  useEffect(() => {
    if (isOpen && assistantInitialQuery) {
      const q = assistantInitialQuery;
      if (setAssistantInitialQuery) setAssistantInitialQuery(null);
      handleSend(q);
    }
  }, [isOpen, assistantInitialQuery]);

  const handleSend = async (queryText, options = {}) => {
    const text = queryText !== undefined ? queryText : inputText;
    if ((!text.trim() && !options.action) || loading) return;

    const sessionId = getSessionId();

    if (text.trim() && options.action !== 'feedback_negative' && options.action !== 'more') {
      const userMsg = {
        id: Date.now().toString(),
        sender: 'user',
        text: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setInputText('');
    setLoading(true);

    try {
      const response = await sendAssistantMessage(text.trim(), {
        sessionId,
        ...options,
      });

      setActivePreferences(response.activePreferences || {});

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.reply,
        dishes: response.dishes || [],
        suggestions: response.suggestions || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'I apologize, I had trouble retrieving recommendations. Tap a suggestion chip or ask me again!',
          dishes: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const sessionId = getSessionId();
    setLoading(true);
    setShowMenuOptions(false);
    try {
      await resetAssistantSession(sessionId);
      setActivePreferences({});
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: 'Conversation reset! What are you craving today? Ask for spicy grills, fresh salads, or dishes under ₹300.',
          showChips: true,
          dishes: [],
        },
      ]);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#E8602C] hover:bg-[#D14E1E] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
        aria-label="Food Assistant"
      >
        <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      {/* Click outside to close (desktop) */}
      <div className="hidden sm:block absolute inset-0" onClick={() => setIsOpen(false)} />

      {/* Main Assistant Panel matching Screen 4 */}
      <div className="relative w-full h-full sm:h-[92vh] sm:max-h-[720px] sm:w-[440px] sm:mr-6 bg-[#FAF6F0] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up z-10">
        {/* 1. Header matching Screen 4 */}
        <div className="h-16 px-4 bg-white border-b border-[#EAE3D6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 -ml-1 text-[#1A1A1A] hover:text-[#E8602C] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E8602C] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1A1A1A] leading-tight">
                  Food Assistant
                </h3>
                <span className="text-[11px] text-[#8C8275] block -mt-0.5">
                  Your AI dining guide
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenuOptions(!showMenuOptions)}
              className="p-1.5 text-[#6B655D] hover:text-[#1A1A1A] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenuOptions && (
              <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-[#EAE3D6] py-1.5 z-30 animate-fade-in">
                <button
                  onClick={handleReset}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#1A1A1A] hover:bg-orange-50 hover:text-[#E8602C] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Chat Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.sender === 'user' ? (
                /* User Bubble matching Screen 4 */
                <div className="flex justify-end">
                  <div className="max-w-[82%] bg-[#E8602C] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-sm font-medium shadow-2xs leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ) : (
                /* Bot Message Bubble matching Screen 4 */
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#E8602C] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] bg-white border border-[#EAE3D6] rounded-2xl rounded-tl-xs p-3.5 text-xs sm:text-sm text-[#1A1A1A] shadow-2xs leading-relaxed">
                      {msg.text}
                    </div>
                  </div>

                  {/* Suggestion Chips Section on Welcome Screen */}
                  {msg.showChips && (
                    <div className="pl-9 space-y-2">
                      <span className="text-[11px] font-bold text-[#8C8275]">
                        What are you looking for?
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestionChips.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(chip.query)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EAE3D6] hover:border-[#E8602C] text-[11px] font-medium text-[#1A1A1A] hover:text-[#E8602C] shadow-2xs hover:shadow-xs transition-all text-left cursor-pointer"
                          >
                            <span className="text-xs">{chip.icon}</span>
                            <span className="truncate">{chip.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Dishes Carousel matching Screen 4 */}
                  {msg.dishes && msg.dishes.length > 0 && (
                    <div className="pl-9 pt-1">
                      <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-2">
                        {msg.dishes.map((dish) => (
                          <div
                            key={dish._id}
                            onClick={() => setSelectedDish(dish)}
                            className="w-40 shrink-0 bg-white rounded-2xl border border-[#EAE3D6] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#E8602C]/60 transition-all cursor-pointer flex flex-col justify-between select-none"
                          >
                            <div className="relative aspect-square w-full bg-[#FAF6F0] overflow-hidden">
                              <img
                                src={resolveDishImage(dish.primaryImage)}
                                alt={dish.name}
                                onError={handleImageError}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    dish.isVeg ? 'bg-emerald-600' : 'bg-[#E8602C]'
                                  }`}
                                />
                                <span className="text-[9px] font-bold text-[#1A1A1A]">
                                  {dish.isVeg ? 'Veg' : 'Non-Veg'}
                                </span>
                              </div>
                              <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs">
                                <Heart className="w-3 h-3 text-[#8C8275]" />
                              </div>
                            </div>

                            <div className="p-2.5 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-serif font-bold text-xs text-[#1A1A1A] truncate">
                                  {dish.name}
                                </h4>
                                {dish.arabicName && (
                                  <span className="font-arabic text-[10px] text-[#C9953C] block truncate">
                                    {dish.arabicName}
                                  </span>
                                )}
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#E8602C] font-semibold">
                                  <Star className="w-3 h-3 fill-[#E8602C]" />
                                  <span>{dish.averageRating?.toFixed(1) || '4.8'}</span>
                                  <span className="text-[#8C8275] font-normal">
                                    ({dish.totalRatings || 140})
                                  </span>
                                </div>
                                {dish.matchReason && (
                                  <span className="inline-block max-w-full truncate text-[9px] font-medium text-[#8A3B14] bg-orange-50 px-1.5 py-0.5 rounded-md mt-1 border border-orange-200/60">
                                    {dish.matchReason}
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 pt-1.5 border-t border-[#F2EBE0] flex items-center justify-between">
                                <span className="font-serif font-bold text-xs text-[#1A1A1A]">
                                  ₹{dish.price}
                                </span>
                                <span className="text-[10px] text-[#E8602C] font-bold">View</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Follow-up Suggestions from Backend */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pl-9 pt-1 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((chip, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 border border-[#EAE3D6] hover:border-[#E8602C] text-[#6B655D] hover:text-[#E8602C] text-[11px] font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 pl-9 text-xs text-[#8C8275]">
              <div className="w-2 h-2 rounded-full bg-[#E8602C] animate-ping" />
              <span>Finding delicious recommendations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Bottom Input Bar matching Screen 4 */}
        <div className="p-3 bg-white border-t border-[#EAE3D6] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => handleSend("Chef's recommendations")}
              className="w-9 h-9 rounded-full bg-[#FAF6F0] hover:bg-orange-50 text-[#8C8275] hover:text-[#E8602C] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Add more options"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask anything about the menu..."
                className="w-full bg-[#FAF6F0] border border-[#EAE3D6] rounded-full px-4 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C8275] focus:outline-none focus:border-[#E8602C] focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-9 h-9 rounded-full bg-[#E8602C] hover:bg-[#D14E1E] disabled:opacity-50 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
