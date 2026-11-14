import { MenuItem } from '../models/MenuItem.js';
import { Category } from '../models/Category.js';
import { sessionStore } from './sessionStore.js';

/**
 * Normalizes query string for uniform NLP parsing
 */
const cleanText = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/['"’`]/g, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Extracts structured intent and preferences from customer natural-language message
 */
export const extractIntent = (rawMessage, currentPreferences = {}, categories = [], allItems = []) => {
  const query = cleanText(rawMessage);
  const words = query.split(' ');

  const intent = {
    action: 'recommend', // 'recommend' | 'more' | 'reset' | 'similar' | 'feedback_negative' | 'clarify'
    foodType: null,      // 'veg' | 'nonVeg' | null
    ingredients: [],
    excludedIngredients: [],
    flavours: [],
    excludedFlavours: [],
    preparationMethods: [],
    characteristics: [],
    categories: [],
    excludedCategories: [],
    mealRoles: [],
    maxPrice: null,
    clearMaxPrice: false,
    referenceDish: null,
    rejectedDishName: null,
    isAmbiguous: false,
  };

  if (!query) {
    intent.action = 'clarify';
    return intent;
  }

  // 1. Detect Actions & Reset
  if (/^(reset|start over|restart|new search|clear|forget everything|cancel)$/i.test(query) || query.includes('start fresh')) {
    intent.action = 'reset';
    return intent;
  }

  if (/^(show more|more|next|see more|anything else|more options|show others|other options)$/i.test(query) || query.includes('show more') || query.includes('more dishes')) {
    intent.action = 'more';
    return intent;
  }

  if (/^(i don t like this|not interested|hate this|don t want this|show something else|different)$/i.test(query) || query.includes('not interested') || query.includes('dont like') || query.includes('don t like')) {
    intent.action = 'feedback_negative';
  }

  // 2. Detect Budget Constraint & Budget Removal
  if (/(remove budget|no budget|no price limit|any price|forget budget|without budget|remove price)/i.test(query)) {
    intent.clearMaxPrice = true;
  } else {
    const budgetMatch =
      query.match(/(?:under|below|less than|within|upto|max|around|budget of|budget)\s*(?:rs|inr|₹)?\s*(\d+)/i) ||
      query.match(/(?:rs|inr|₹)\s*(\d+)\s*(?:or less|under|below|max)?/i);
    if (budgetMatch && budgetMatch[1]) {
      intent.maxPrice = parseInt(budgetMatch[1], 10);
    }
  }

  // 3. Detect Negative Exclusions ("I don't want X", "no X", "without X", "avoid X")
  const exclusionPatterns = [
    /(?:dont want|do not want|no|without|avoid|exclude|hate|dislike|not like)\s+([a-z\s]+)/gi,
  ];

  for (const pattern of exclusionPatterns) {
    let match;
    while ((match = pattern.exec(query)) !== null) {
      const excludedPhrase = match[1].trim();
      if (excludedPhrase.includes('chicken')) intent.excludedIngredients.push('chicken');
      if (excludedPhrase.includes('lamb') || excludedPhrase.includes('meat') || excludedPhrase.includes('mutton')) intent.excludedIngredients.push('lamb');
      if (excludedPhrase.includes('rice') || excludedPhrase.includes('mandi') || excludedPhrase.includes('biryani') || excludedPhrase.includes('kabsa')) {
        intent.excludedCategories.push('rice-pot');
        intent.excludedIngredients.push('rice');
      }
      if (excludedPhrase.includes('onion')) intent.excludedIngredients.push('onion');
      if (excludedPhrase.includes('garlic')) intent.excludedIngredients.push('garlic');
      if (excludedPhrase.includes('cheese') || excludedPhrase.includes('dairy')) intent.excludedIngredients.push('cheese');
      if (excludedPhrase.includes('spicy') || excludedPhrase.includes('hot')) intent.excludedFlavours.push('spicy');
    }
  }

  // 4. Detect Dietary Constraints (Veg / Non-Veg)
  const isExplicitVeg =
    /\b(veg|vegetarian|pure veg|only veg|shakahari|plant based)\b/i.test(query) &&
    !/\b(non veg|non-veg|not veg|chicken|meat|lamb|mutton|fish|beef)\b/i.test(query);

  const isExplicitNonVeg =
    /\b(non veg|non-veg|meat|chicken|lamb|mutton|kebab|fish|prawn|beef)\b/i.test(query);

  if (isExplicitVeg) {
    intent.foodType = 'veg';
  } else if (isExplicitNonVeg) {
    intent.foodType = 'nonVeg';
  }

  // 5. Detect Positive Ingredients (if not excluded)
  if (/\bchicken\b/i.test(query) && !intent.excludedIngredients.includes('chicken')) {
    intent.ingredients.push('chicken');
    if (!intent.foodType) intent.foodType = 'nonVeg';
  }
  if (/\b(lamb|mutton|meat)\b/i.test(query) && !intent.excludedIngredients.includes('lamb')) {
    intent.ingredients.push('lamb');
    if (!intent.foodType) intent.foodType = 'nonVeg';
  }
  if (/\b(chickpea|chickpeas|hummus)\b/i.test(query) && !intent.excludedIngredients.includes('chickpeas')) {
    intent.ingredients.push('chickpeas');
  }
  if (/\b(eggplant|brinjal|mutabal|baba)\b/i.test(query)) {
    intent.ingredients.push('eggplant');
  }
  if (/\b(cheese|paneer)\b/i.test(query) && !intent.excludedIngredients.includes('cheese')) {
    intent.ingredients.push('cheese');
  }
  if (/\b(rice|mandi|kabsa|biryani)\b/i.test(query) && !intent.excludedIngredients.includes('rice')) {
    intent.ingredients.push('rice');
  }

  // 6. Detect Flavours
  if (/\b(spicy|hot|chilli|pepper|tikka|peri|fiery|teekha|masaledar)\b/i.test(query) && !intent.excludedFlavours.includes('spicy')) {
    intent.flavours.push('spicy');
  }
  if (/\b(mild|less spicy|not spicy|low spice|not too spicy)\b/i.test(query)) {
    intent.flavours.push('mild');
    intent.excludedFlavours.push('spicy');
  }
  if (/\b(creamy|cheese|labneh|saucy|butter|rich)\b/i.test(query)) {
    intent.flavours.push('creamy');
  }
  if (/\b(smoky|charcoal|bbq|tandoor|faham)\b/i.test(query)) {
    intent.flavours.push('smoky');
  }
  if (/\b(tangy|sour|lemon|sumac|zesty)\b/i.test(query)) {
    intent.flavours.push('tangy');
  }
  if (/\b(sweet|dessert|sugar|honey)\b/i.test(query)) {
    intent.flavours.push('sweet');
  }

  // 7. Detect Preparation Methods
  if (/\b(grill|grilled|kebab|kebabs|skewer|faham|al faham|taouk|sheesh|charcoal)\b/i.test(query)) {
    intent.preparationMethods.push('grilled');
    intent.categories.push('on-the-grills');
  }
  if (/\b(fried|crispy|deep fried|crunchy|falafel|sambousak|rakakat)\b/i.test(query)) {
    intent.preparationMethods.push('fried');
  }
  if (/\b(baked|oven|clay oven|manakeesh|arayes)\b/i.test(query)) {
    intent.preparationMethods.push('baked');
  }
  if (/\b(roasted|shawarma|spit roasted)\b/i.test(query)) {
    intent.preparationMethods.push('roasted');
  }
  if (/\b(slow-cooked|slow cooked|stew|stewed|pot|mandi|kabsa|maqluba|harira|shurba)\b/i.test(query)) {
    intent.preparationMethods.push('slow-cooked');
  }

  // 8. Detect Characteristics
  if (/\b(light|healthy|fresh|diet|low calorie|clean|greens|salad|soup)\b/i.test(query)) {
    intent.characteristics.push('light', 'healthy');
  }
  if (/\b(filling|hearty|heavy|satisfying|large portion|big meal)\b/i.test(query)) {
    intent.characteristics.push('filling');
  }
  if (/\b(rich|royal|platter|feast)\b/i.test(query)) {
    intent.characteristics.push('rich');
  }

  // 9. Detect Category / Meal Role
  if (/\b(dessert|desserts|sweet|sweets|baklava|kunafeh|cake|pudding|ice cream)\b/i.test(query)) {
    intent.categories.push('desserts');
    intent.mealRoles.push('dessert');
  }
  if (/\b(soup|soups|shurba|harira|broth)\b/i.test(query)) {
    intent.categories.push('shurba-soup');
    intent.mealRoles.push('starter');
  }
  if (/\b(salad|salads|sulta|tabbouleh|fattoush)\b/i.test(query)) {
    intent.categories.push('sulta-salads');
    intent.mealRoles.push('starter');
  }
  if (/\b(mezze|cold mezze|hot mezze|appetizer|appetizers|starter|starters|arabic starters|dips|hummus)\b/i.test(query)) {
    intent.categories.push('hummus-bowls', 'cold-mezze', 'hot-mezze', 'sulta-salads', 'shurba-soup');
    intent.mealRoles.push('starter');
  }
  if (/\b(shawarma|roll|rolls|wrap|pita|pocket)\b/i.test(query)) {
    intent.categories.push('shawarma-pita', 'rolls-pockets');
    intent.mealRoles.push('snack', 'main');
  }
  if (/\b(rice|mandi|kabsa|maqluba|rice pot|biryani)\b/i.test(query) && !intent.excludedCategories.includes('rice-pot') && !intent.excludedIngredients.includes('rice')) {
    intent.categories.push('rice-pot');
    intent.mealRoles.push('main');
  }
  if (/\b(drink|drinks|beverage|beverages|mojito|tea|coffee|cooler|juice)\b/i.test(query)) {
    intent.categories.push('drinks-beverages', 'hot-beverages-addons');
    intent.mealRoles.push('beverage');
  }

  // 10. Detect Reference Dish for Similarity ("similar to X", "like X", "more like X")
  const similarityMatch =
    query.match(/(?:similar to|something like|more like|dishes like|like)\s+([a-z0-9\s]+)/i);

  if (similarityMatch && similarityMatch[1]) {
    const targetName = similarityMatch[1].trim();
    const matchedItem = allItems.find(
      (item) =>
        item.name.toLowerCase().includes(targetName) ||
        targetName.includes(item.name.toLowerCase())
    );
    if (matchedItem) {
      intent.action = 'similar';
      intent.referenceDish = matchedItem;
    }
  } else if (/\b(similar|similar dishes|recommend something similar|like this|something like this)\b/i.test(query)) {
    intent.action = 'similar';
  }

  // Check if query is just a greeting
  if (/^(hi|hello|hey|marhaba|salam|good morning|good evening)$/i.test(query)) {
    intent.action = 'greeting';
  }

  return intent;
};

/**
 * Merges extracted intent with accumulated conversation preferences
 */
export const mergePreferences = (existing = {}, newIntent = {}) => {
  const merged = {
    foodType: existing.foodType || null,
    ingredients: [...(existing.ingredients || [])],
    excludedIngredients: [...(existing.excludedIngredients || [])],
    flavours: [...(existing.flavours || [])],
    excludedFlavours: [...(existing.excludedFlavours || [])],
    preparationMethods: [...(existing.preparationMethods || [])],
    characteristics: [...(existing.characteristics || [])],
    categories: [...(existing.categories || [])],
    excludedCategories: [...(existing.excludedCategories || [])],
    mealRoles: [...(existing.mealRoles || [])],
    maxPrice: existing.maxPrice !== undefined ? existing.maxPrice : null,
    excludedDishIds: [...(existing.excludedDishIds || [])],
    rejectedDishIds: [...(existing.rejectedDishIds || [])],
    referenceDishId: newIntent.referenceDish ? newIntent.referenceDish._id.toString() : (existing.referenceDishId || null),
  };

  // 1. Dietary override
  if (newIntent.foodType) {
    merged.foodType = newIntent.foodType;
    if (newIntent.foodType === 'veg') {
      // Clear any previous meat ingredients
      merged.ingredients = merged.ingredients.filter(
        (i) => !['chicken', 'lamb', 'meat', 'mutton', 'beef', 'fish'].includes(i.toLowerCase())
      );
    }
  }

  // 2. Budget override
  if (newIntent.clearMaxPrice) {
    merged.maxPrice = null;
  } else if (newIntent.maxPrice !== null && newIntent.maxPrice !== undefined) {
    merged.maxPrice = newIntent.maxPrice;
  }

  // 3. Exclusions
  if (newIntent.excludedIngredients?.length) {
    for (const item of newIntent.excludedIngredients) {
      if (!merged.excludedIngredients.includes(item)) {
        merged.excludedIngredients.push(item);
      }
      merged.ingredients = merged.ingredients.filter((i) => i.toLowerCase() !== item.toLowerCase());
    }
  }

  if (newIntent.excludedFlavours?.length) {
    for (const f of newIntent.excludedFlavours) {
      if (!merged.excludedFlavours.includes(f)) {
        merged.excludedFlavours.push(f);
      }
      merged.flavours = merged.flavours.filter((fav) => fav.toLowerCase() !== f.toLowerCase());
    }
  }

  if (newIntent.excludedCategories?.length) {
    for (const cat of newIntent.excludedCategories) {
      if (!merged.excludedCategories.includes(cat)) {
        merged.excludedCategories.push(cat);
      }
      merged.categories = merged.categories.filter((c) => c !== cat);
    }
  }

  // 4. Positive Attributes Accumulation
  if (newIntent.ingredients?.length) {
    for (const ing of newIntent.ingredients) {
      if (!merged.ingredients.includes(ing) && !merged.excludedIngredients.includes(ing)) {
        merged.ingredients.push(ing);
      }
    }
  }

  if (newIntent.flavours?.length) {
    for (const f of newIntent.flavours) {
      if (!merged.flavours.includes(f) && !merged.excludedFlavours.includes(f)) {
        merged.flavours.push(f);
      }
    }
  }

  if (newIntent.preparationMethods?.length) {
    for (const p of newIntent.preparationMethods) {
      if (!merged.preparationMethods.includes(p)) {
        merged.preparationMethods.push(p);
      }
    }
  }

  if (newIntent.characteristics?.length) {
    for (const ch of newIntent.characteristics) {
      if (!merged.characteristics.includes(ch)) {
        merged.characteristics.push(ch);
      }
    }
  }

  if (newIntent.categories?.length) {
    merged.categories = Array.from(new Set([...merged.categories, ...newIntent.categories]));
  }

  if (newIntent.mealRoles?.length) {
    merged.mealRoles = Array.from(new Set([...merged.mealRoles, ...newIntent.mealRoles]));
  }

  return merged;
};

/**
 * Filter candidates by MANDATORY hard constraints
 */
export const applyMandatoryFilters = (candidates = [], preferences = {}, categoryMap = new Map()) => {
  return candidates.filter((item) => {
    // 1. Availability and active status
    if (item.isActive === false || item.isAvailable === false) {
      return false;
    }

    // 2. Veg / Non-Veg mandatory restriction
    if (preferences.foodType === 'veg' && item.isVeg !== true) {
      return false;
    }
    if (preferences.foodType === 'nonVeg' && item.isVeg === true) {
      // If user strictly requested non-veg, only show non-veg dishes
      return false;
    }

    // 3. Maximum Budget mandatory constraint
    if (preferences.maxPrice !== null && preferences.maxPrice !== undefined) {
      if (item.price > preferences.maxPrice) {
        return false;
      }
    }

    // 4. Excluded Ingredients mandatory restriction
    if (preferences.excludedIngredients?.length) {
      const name = item.name.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());
      const ingredients = (item.ingredients || []).map((i) => i.toLowerCase());

      for (const excluded of preferences.excludedIngredients) {
        const ex = excluded.toLowerCase();
        if (
          name.includes(ex) ||
          desc.includes(ex) ||
          tags.includes(ex) ||
          ingredients.some((i) => i.includes(ex))
        ) {
          return false;
        }
      }
    }

    // 5. Excluded Categories mandatory restriction
    if (preferences.excludedCategories?.length) {
      const cat = categoryMap.get(item.categoryId?.toString());
      if (cat && preferences.excludedCategories.includes(cat.slug)) {
        return false;
      }
    }

    // 6. Explicitly Rejected or Excluded Dishes
    if (preferences.rejectedDishIds?.includes(item._id.toString())) {
      return false;
    }
    if (preferences.excludedDishIds?.includes(item._id.toString())) {
      return false;
    }
    if (preferences.referenceDishId && item._id.toString() === preferences.referenceDishId.toString()) {
      return false;
    }

    return true;
  });
};

/**
 * Multi-Attribute Scoring Engine
 * Weights: Food Type (25%), Ingredients (25%), Flavours (20%), Preparation (15%), Category (10%), Characteristics (5%)
 */
export const scoreAndRank = (candidates = [], preferences = {}, referenceDish = null, categoryMap = new Map()) => {
  return candidates.map((item) => {
    let score = 0;
    const reasons = [];

    const name = item.name.toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const tags = (item.tags || []).map((t) => t.toLowerCase());
    const flavours = (item.flavours || []).map((f) => f.toLowerCase());
    const prep = (item.preparationMethods || []).map((p) => p.toLowerCase());
    const chars = (item.characteristics || []).map((c) => c.toLowerCase());
    const ingredients = (item.ingredients || []).map((i) => i.toLowerCase());
    const cat = categoryMap.get(item.categoryId?.toString());
    const catSlug = cat?.slug || '';
    const catName = (cat?.name || '').toLowerCase();

    // 1. Food Type Match (25 pts)
    if (preferences.foodType === 'veg' && item.isVeg) {
      score += 25;
      reasons.push('Vegetarian');
    } else if (preferences.foodType === 'nonVeg' && !item.isVeg) {
      score += 25;
    }

    // 2. Ingredient Match (25 pts)
    if (preferences.ingredients?.length) {
      let matchedIng = false;
      for (const ing of preferences.ingredients) {
        const cleanIng = ing.toLowerCase();
        if (
          name.includes(cleanIng) ||
          desc.includes(cleanIng) ||
          tags.includes(cleanIng) ||
          ingredients.some((i) => i.includes(cleanIng))
        ) {
          score += 25;
          matchedIng = true;
          reasons.push(ing.charAt(0).toUpperCase() + ing.slice(1));
          break;
        }
      }
      if (!matchedIng) {
        // If an explicit ingredient was asked (e.g. 'chicken'), penalize items missing that ingredient
        score -= 20;
      }
    }

    // 3. Flavour Match (20 pts)
    if (preferences.flavours?.length) {
      for (const fav of preferences.flavours) {
        const cleanFav = fav.toLowerCase();
        if (
          flavours.includes(cleanFav) ||
          tags.includes(cleanFav) ||
          name.includes(cleanFav) ||
          desc.includes(cleanFav)
        ) {
          score += 20;
          reasons.push(fav.charAt(0).toUpperCase() + fav.slice(1));
          break;
        }
      }
    }

    // 4. Preparation Method Match (15 pts)
    if (preferences.preparationMethods?.length) {
      for (const p of preferences.preparationMethods) {
        const cleanP = p.toLowerCase();
        if (prep.includes(cleanP) || tags.includes(cleanP) || name.includes(cleanP) || desc.includes(cleanP)) {
          score += 15;
          reasons.push(p.charAt(0).toUpperCase() + p.slice(1));
          break;
        }
      }
    }

    // 5. Category / Concept Match (10 pts)
    if (preferences.categories?.length) {
      if (preferences.categories.includes(catSlug) || preferences.categories.some((c) => catName.includes(c))) {
        score += 10;
        if (cat?.name) reasons.push(cat.name);
      }
    }
    if (preferences.mealRoles?.length) {
      if (preferences.mealRoles.includes(item.mealRole)) {
        score += 10;
      }
    }

    // 6. Characteristics Match (5 pts)
    if (preferences.characteristics?.length) {
      for (const ch of preferences.characteristics) {
        const cleanCh = ch.toLowerCase();
        if (chars.includes(cleanCh) || tags.includes(cleanCh) || desc.includes(cleanCh)) {
          score += 5;
          reasons.push(ch.charAt(0).toUpperCase() + ch.slice(1));
        }
      }
    }

    // 7. Reference Dish Similarity Bonus (up to 30 pts)
    if (referenceDish && referenceDish._id.toString() !== item._id.toString()) {
      let simScore = 0;
      // Same category
      if (referenceDish.categoryId?.toString() === item.categoryId?.toString()) {
        simScore += 12;
      }
      // Same dietary type
      if (referenceDish.isVeg === item.isVeg) {
        simScore += 6;
      }
      // Shared flavours
      const sharedFlavours = (referenceDish.flavours || []).filter((f) => flavours.includes(f));
      simScore += sharedFlavours.length * 4;

      // Shared prep methods
      const sharedPrep = (referenceDish.preparationMethods || []).filter((p) => prep.includes(p));
      simScore += sharedPrep.length * 4;

      score += Math.min(simScore, 30);
      if (simScore > 10) reasons.push('Similar to ' + referenceDish.name);
    }

    // 8. Bestseller / Chef's choice minor tie-breaker (2-3 pts only!)
    if (item.badges?.includes('bestseller')) score += 3;
    if (item.badges?.includes('chef_choice')) score += 2;

    return {
      item,
      score,
      matchReason: Array.from(new Set(reasons)).slice(0, 3).join(' • '),
    };
  });
};

/**
 * Generates natural-language conversational response based on active filters and results
 */
const generateResponseReply = (topItems = [], preferences = {}, intent = {}, referenceDish = null) => {
  if (topItems.length === 0) {
    if (preferences.foodType === 'veg' && preferences.maxPrice) {
      return `We do not have vegetarian dishes under ₹${preferences.maxPrice} right now. Would you like to view our delicious Cold Mezze & Salads starting from ₹285?`;
    }
    if (preferences.ingredients?.includes('chicken') && preferences.flavours?.includes('spicy')) {
      return `I couldn't find spicy chicken dishes matching all your current filters. Would you like to explore our other grilled chicken dishes or remove a filter?`;
    }
    if (preferences.maxPrice) {
      return `No dishes found under ₹${preferences.maxPrice}. Try increasing your budget or checking our Rolls, Soups, and Cold Mezze!`;
    }
    return `I couldn't find available dishes matching those exact requirements. Would you like to adjust your preferences or start fresh?`;
  }

  if (intent.action === 'more') {
    return `Here are more great dishes that match what you're looking for:`;
  }

  if (referenceDish) {
    return `Dishes similar to **${referenceDish.name}** crafted with authentic spices and Middle Eastern preparation:`;
  }

  const parts = [];
  if (preferences.foodType === 'veg') parts.push('vegetarian');
  if (preferences.flavours?.length) parts.push(preferences.flavours.join(' & '));
  if (preferences.preparationMethods?.length) parts.push(preferences.preparationMethods.join(' '));
  if (preferences.ingredients?.length) parts.push(preferences.ingredients.join(' & '));
  if (preferences.categories?.length) parts.push(preferences.categories[0].replace('-', ' '));

  let desc = parts.join(' ').trim();
  if (!desc) desc = 'delicious dishes';

  let budgetStr = preferences.maxPrice ? ` under ₹${preferences.maxPrice}` : '';

  return `Here are our best ${desc}${budgetStr} prepared fresh:`;
};

/**
 * Main Controller Function for AI Food Assistant
 */
export const processAssistantQuery = async (queryText, options = {}) => {
  const {
    sessionId = null,
    action: clientAction = null,
    referenceDishId = null,
    feedbackTargetDishId = null,
    interactionContext = null,
  } = options;

  // 1. Retrieve or Create Conversation Session
  const session = sessionStore.getOrCreate(sessionId);
  session.turnCount += 1;

  if (interactionContext) {
    session.interactionContext = {
      ...session.interactionContext,
      ...interactionContext,
    };
  }

  // 2. Fetch Active Menu Items and Categories from MongoDB
  const [categories, allItems] = await Promise.all([
    Category.find({ isActive: true }).lean(),
    MenuItem.find({ isActive: true }).lean(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

  // Handle Explicit Feedback: "Not interested in dish X"
  if (clientAction === 'feedback_negative' && feedbackTargetDishId) {
    if (!session.currentPreferences.rejectedDishIds.includes(feedbackTargetDishId)) {
      session.currentPreferences.rejectedDishIds.push(feedbackTargetDishId);
    }
  }

  // Handle Explicit Reset
  if (clientAction === 'reset' || /^(reset|clear|start over|restart)$/i.test((queryText || '').trim())) {
    const refreshed = sessionStore.reset(session.sessionId);
    return {
      reply: 'Marhaba! 👋 Welcome to Qissa. Craving something spicy, grilled, hearty, or sweet? Ask me or tap a suggestion below!',
      dishes: [],
      activePreferences: refreshed.currentPreferences,
      suggestions: ['🔥 Spicy Food', '🍢 Grilled Food', '🌱 Pure Veg', '🍰 Desserts', '💰 Under ₹300'],
      sessionId: refreshed.sessionId,
    };
  }

  // Handle Greeting
  if (/^(hi|hello|hey|marhaba|salam|good morning|good evening)$/i.test((queryText || '').trim())) {
    return {
      reply: 'Marhaba! 👋 I am your Qissa Food Assistant. Tell me what you are craving—like spicy grills, slow-cooked Mandi, light salads, or desserts under ₹300!',
      dishes: [],
      activePreferences: session.currentPreferences,
      suggestions: ['🔥 Spicy Food', '🍢 Grilled Food', '🌱 Pure Veg', '🍰 Desserts', '💰 Under ₹300'],
      sessionId: session.sessionId,
    };
  }

  // 3. Extract Intent from Natural Language
  const intent = extractIntent(queryText, session.currentPreferences, categories, allItems);

  // If client provided a specific reference dish ID
  let referenceDish = intent.referenceDish;
  if (!referenceDish && referenceDishId) {
    referenceDish = allItems.find((i) => i._id.toString() === referenceDishId.toString()) || null;
  }
  if (!referenceDish && intent.action === 'similar' && session.lastReferencedDish) {
    referenceDish = session.lastReferencedDish;
  }
  // 4. Merge New Intent with Cumulative Session Preferences
  session.currentPreferences = mergePreferences(session.currentPreferences, intent);

  if (referenceDish) {
    session.lastReferencedDish = referenceDish;
    session.currentPreferences.referenceDishId = referenceDish._id.toString();
  }

  // 5. Apply Mandatory Hard Filters
  const eligibleCandidates = applyMandatoryFilters(
    allItems,
    session.currentPreferences,
    categoryMap
  );

  // 6. Score and Rank Eligible Candidates
  const scored = scoreAndRank(
    eligibleCandidates,
    session.currentPreferences,
    session.lastReferencedDish,
    categoryMap
  );

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // 7. Paginate / Avoid Previously Recommended Dishes
  const alreadyRecommended = new Set(session.previouslyRecommendedIds || []);
  let unrecommended = scored.filter((s) => !alreadyRecommended.has(s.item._id.toString()));

  // If all matching dishes have been shown, cycle back through the top scored
  let selectedSlice;
  if (unrecommended.length > 0) {
    selectedSlice = unrecommended.slice(0, 4);
  } else {
    selectedSlice = scored.slice(0, 4);
  }

  // Record newly recommended dish IDs
  for (const s of selectedSlice) {
    if (!session.previouslyRecommendedIds.includes(s.item._id.toString())) {
      session.previouslyRecommendedIds.push(s.item._id.toString());
    }
  }

  session.lastRecommendedDishes = selectedSlice.map((s) => s.item);

  // 8. Format Final Image-First Dishes Payload
  const topDishes = selectedSlice.map((s) => ({
    _id: s.item._id,
    name: s.item.name,
    arabicName: s.item.arabicName,
    price: s.item.price,
    primaryImage: s.item.primaryImage,
    isVeg: s.item.isVeg,
    badges: s.item.badges || [],
    categoryName: categoryMap.get(s.item.categoryId?.toString())?.name || '',
    matchReason: s.matchReason,
    score: s.score,
    flavours: s.item.flavours || [],
    preparationMethods: s.item.preparationMethods || [],
  }));

  // 9. Generate Natural Conversational Reply
  const replyText = generateResponseReply(
    topDishes,
    session.currentPreferences,
    intent,
    session.lastReferencedDish
  );

  // Dynamic follow-up chips
  const dynamicSuggestions = [];
  if (scored.length > 4) dynamicSuggestions.push('Show more');
  if (!session.currentPreferences.maxPrice) dynamicSuggestions.push('Under ₹350');
  if (session.currentPreferences.foodType !== 'veg') dynamicSuggestions.push('Make it Veg');
  if (!session.currentPreferences.flavours?.includes('spicy')) dynamicSuggestions.push('Make it Spicy');
  dynamicSuggestions.push('Reset preferences');

  return {
    reply: replyText,
    dishes: topDishes,
    activePreferences: session.currentPreferences,
    suggestions: dynamicSuggestions,
    sessionId: session.sessionId,
    totalMatches: scored.length,
  };
};

/**
 * Recommendations for an Individual Menu Item (e.g. on Food Detail Modal)
 * Finds closely related dishes using verified culinary attributes:
 * 1. Admin-configured related items (if any)
 * 2. Shared key ingredients (e.g. chicken, lamb, rice, lentils)
 * 3. Matching preparation method (e.g. grilled, slow-cooked, baked, roasted)
 * 4. Matching flavour profile (e.g. spicy, smoky, mild, creamy, tangy)
 * 5. Matching meal role (e.g. main, starter, dessert, beverage)
 * 6. Matching category / food concept
 * 
 * Hard restrictions:
 * - Exclude current dish
 * - Exclude unavailable dishes (isAvailable === false)
 * - Exclude inactive dishes (isActive === false)
 * - Respect optional dietary filter (isVeg === true/false) if supplied in options
 */
export const getRelatedDishes = async (dishId, options = {}) => {
  const { isVeg = null, limit = 4 } = options;

  const [targetDish, allItems, categories] = await Promise.all([
    MenuItem.findById(dishId).populate('categoryId', 'name slug').lean(),
    MenuItem.find({ isActive: true, isAvailable: true })
      .populate('categoryId', 'name slug')
      .lean(),
    Category.find({ isActive: true }).lean(),
  ]);

  if (!targetDish || !targetDish.isActive) {
    return null;
  }

  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

  // Candidates: exclude target dish and unavailable dishes
  let candidates = allItems.filter((item) => item._id.toString() !== targetDish._id.toString());

  // Hard filter: dietary preference if explicitly specified
  if (isVeg !== null && isVeg !== undefined && isVeg !== '' && isVeg !== 'all') {
    const vegBool = isVeg === 'true' || isVeg === true;
    candidates = candidates.filter((item) => item.isVeg === vegBool);
  }

  // Target dish attributes for matching
  const targetFlavours = (targetDish.flavours || []).map((f) => f.toLowerCase());
  const targetPrep = (targetDish.preparationMethods || []).map((p) => p.toLowerCase());
  const targetChars = (targetDish.characteristics || []).map((c) => c.toLowerCase());
  const targetIngredients = (targetDish.ingredients || []).map((i) => i.toLowerCase().trim());
  const targetTags = (targetDish.tags || []).map((t) => t.toLowerCase().trim());
  const targetCatId = targetDish.categoryId?._id ? targetDish.categoryId._id.toString() : targetDish.categoryId?.toString();

  // Score each candidate
  const scored = candidates.map((item) => {
    let score = 0;
    const matchReasons = [];

    const itemFlavours = (item.flavours || []).map((f) => f.toLowerCase());
    const itemPrep = (item.preparationMethods || []).map((p) => p.toLowerCase());
    const itemChars = (item.characteristics || []).map((c) => c.toLowerCase());
    const itemIngredients = (item.ingredients || []).map((i) => i.toLowerCase().trim());
    const itemTags = (item.tags || []).map((t) => t.toLowerCase().trim());
    const itemCatId = item.categoryId?._id ? item.categoryId._id.toString() : item.categoryId?.toString();

    // 1. Dietary Affinity (Same dietary type gives strong cohesion)
    if (item.isVeg === targetDish.isVeg) {
      score += 15;
    }

    // 2. Ingredient Affinity: shared ingredients or tags
    const sharedIngredients = targetIngredients.filter((ti) =>
      itemIngredients.some((ii) => ii.includes(ti) || ti.includes(ii)) ||
      itemTags.some((tag) => tag.includes(ti) || ti.includes(tag))
    );
    if (sharedIngredients.length > 0) {
      score += Math.min(sharedIngredients.length * 15, 35);
      const sample = sharedIngredients[0];
      matchReasons.push(sample.charAt(0).toUpperCase() + sample.slice(1));
    }

    // 3. Preparation Method Match
    const sharedPrep = targetPrep.filter((tp) => itemPrep.includes(tp));
    if (sharedPrep.length > 0) {
      score += Math.min(sharedPrep.length * 12, 25);
      matchReasons.push(sharedPrep[0].charAt(0).toUpperCase() + sharedPrep[0].slice(1));
    }

    // 4. Flavour Profile Match
    const sharedFlavours = targetFlavours.filter((tf) => itemFlavours.includes(tf));
    if (sharedFlavours.length > 0) {
      score += Math.min(sharedFlavours.length * 10, 20);
      matchReasons.push(sharedFlavours[0].charAt(0).toUpperCase() + sharedFlavours[0].slice(1));
    }

    // 5. Meal Role Match (both 'main', both 'starter', both 'dessert', etc.)
    if (targetDish.mealRole && item.mealRole && targetDish.mealRole === item.mealRole) {
      score += 10;
    }

    // 6. Category Match
    if (targetCatId && itemCatId && targetCatId === itemCatId) {
      score += 12;
      const catName = categoryMap.get(itemCatId)?.name;
      if (catName && !matchReasons.includes(catName)) {
        matchReasons.push(catName);
      }
    }

    // 7. Characteristics Match
    const sharedChars = targetChars.filter((tc) => itemChars.includes(tc));
    if (sharedChars.length > 0) {
      score += sharedChars.length * 5;
    }

    // 8. Minor tie-breakers: Bestseller / Chef's choice
    if (item.badges?.includes('bestseller')) score += 3;
    if (item.badges?.includes('chef_choice')) score += 2;

    return {
      item,
      score,
      matchReason: Array.from(new Set(matchReasons)).slice(0, 2).join(' • ') || 'Similar Choice',
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top N
  const results = scored.slice(0, Number(limit) || 4).map((s) => ({
    _id: s.item._id,
    name: s.item.name,
    arabicName: s.item.arabicName,
    price: s.item.price,
    priceOptions: s.item.priceOptions,
    primaryImage: s.item.primaryImage,
    images: s.item.images,
    isVeg: s.item.isVeg,
    badges: s.item.badges || [],
    averageRating: s.item.averageRating || 0,
    totalRatings: s.item.totalRatings || 0,
    categoryName: categoryMap.get(s.item.categoryId?._id?.toString() || s.item.categoryId?.toString())?.name || '',
    matchReason: s.matchReason,
    score: s.score,
    description: s.item.description,
    ingredients: s.item.ingredients || [],
    flavours: s.item.flavours || [],
    preparationMethods: s.item.preparationMethods || [],
    mealRole: s.item.mealRole || 'main',
  }));

  return results;
};
