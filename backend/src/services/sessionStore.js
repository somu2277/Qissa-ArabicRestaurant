/**
 * In-Memory Conversation Session Store for Restaurant Food Assistant
 * Maintains multi-turn conversation context, active customer preferences,
 * previously recommended dish IDs, and interaction context.
 */

class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.ttlMs = 2 * 60 * 60 * 1000; // 2 hours TTL

    // Cleanup expired sessions every 30 minutes
    setInterval(() => this.cleanup(), 30 * 60 * 1000);
  }

  get(sessionId) {
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (Date.now() - session.updatedAt > this.ttlMs) {
      this.sessions.delete(sessionId);
      return null;
    }

    session.updatedAt = Date.now();
    return session;
  }

  create(sessionId) {
    const initialSession = {
      sessionId: sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      turnCount: 0,
      currentPreferences: {
        foodType: null, // 'veg' | 'nonVeg' | null
        ingredients: [],
        excludedIngredients: [],
        flavours: [],
        excludedFlavours: [],
        preparationMethods: [],
        characteristics: [],
        categories: [],
        mealRoles: [],
        maxPrice: null,
        excludedDishIds: [],
        rejectedDishIds: [],
      },
      previouslyRecommendedIds: [],
      lastReferencedDish: null,
      lastRecommendedDishes: [],
      interactionContext: {
        recentlyExploredCategories: [],
        recentlyViewedDishes: [],
      },
      messageHistory: [],
    };

    this.sessions.set(initialSession.sessionId, initialSession);
    return initialSession;
  }

  getOrCreate(sessionId) {
    const existing = this.get(sessionId);
    if (existing) return existing;
    return this.create(sessionId);
  }

  update(sessionId, updates) {
    const session = this.getOrCreate(sessionId);
    Object.assign(session, updates, { updatedAt: Date.now() });
    return session;
  }

  reset(sessionId) {
    if (sessionId && this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
    }
    return this.create(sessionId);
  }

  cleanup() {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.updatedAt > this.ttlMs) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionStore = new SessionStore();
