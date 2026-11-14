import mongoose from 'mongoose';
import { MenuItem } from '../models/MenuItem.js';
import { Category } from '../models/Category.js';
import { ENV } from '../config/env.js';

const enrichDatabase = async () => {
  try {
    console.log('[Enrich] Connecting to MongoDB...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Enrich] Connected!');

    const items = await MenuItem.find().populate('categoryId');
    console.log(`[Enrich] Found ${items.length} items to enrich.`);

    for (const item of items) {
      const name = item.name.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const catSlug = item.categoryId?.slug || '';
      const catName = (item.categoryId?.name || '').toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());

      const flavours = new Set(item.flavours || []);
      const prep = new Set(item.preparationMethods || []);
      const chars = new Set(item.characteristics || []);
      let role = item.mealRole || 'main';

      // 1. Flavours
      if (name.includes('spicy') || name.includes('peri') || desc.includes('spicy') || tags.includes('spicy') || name.includes('sheesh') || name.includes('lahmajoun')) {
        flavours.add('spicy');
      }
      if (name.includes('hummus') || name.includes('labneh') || name.includes('cheese') || desc.includes('creamy') || tags.includes('creamy') || name.includes('toum') || name.includes('bomb')) {
        flavours.add('creamy');
      }
      if (name.includes('grill') || name.includes('faham') || name.includes('kebab') || desc.includes('charcoal') || desc.includes('smoky') || tags.includes('smoky') || name.includes('baba')) {
        flavours.add('smoky');
      }
      if (desc.includes('lemon') || desc.includes('tangy') || desc.includes('sumac') || name.includes('fattoush') || name.includes('tabbouleh') || name.includes('bamia')) {
        flavours.add('tangy');
      }
      if (catSlug.includes('dessert') || name.includes('sweet') || desc.includes('sweet') || name.includes('baklava') || name.includes('kunafeh') || name.includes('cake') || name.includes('mojito') || name.includes('tea')) {
        flavours.add('sweet');
      }
      if (!flavours.has('spicy') && !catSlug.includes('dessert') && !catSlug.includes('drinks')) {
        flavours.add('mild');
      }

      // 2. Preparation Methods
      if (catSlug.includes('grill') || name.includes('grill') || name.includes('faham') || name.includes('kebab') || name.includes('taouk') || name.includes('tikka') || desc.includes('grilled')) {
        prep.add('grilled');
      }
      if (name.includes('fried') || name.includes('crispy') || desc.includes('fried') || name.includes('falafel') || name.includes('sambousak') || name.includes('fries') || name.includes('kibbeh') || name.includes('rakakat')) {
        prep.add('fried');
      }
      if (catSlug.includes('clay-oven') || name.includes('manakeesh') || name.includes('arayes') || name.includes('baked') || desc.includes('baked') || name.includes('baklava') || name.includes('kunafeh')) {
        prep.add('baked');
      }
      if (name.includes('shawarma') || desc.includes('roasted') || name.includes('roasted') || desc.includes('spit-roasted')) {
        prep.add('roasted');
      }
      if (catSlug.includes('rice') || catSlug.includes('gravy') || catSlug.includes('soup') || name.includes('mandi') || name.includes('kabsa') || name.includes('maqluba') || name.includes('stew') || name.includes('harira') || desc.includes('slow-cooked') || desc.includes('simmered')) {
        prep.add('slow-cooked');
      }

      // 3. Characteristics
      if (catSlug.includes('soup') || catSlug.includes('salad') || desc.includes('light') || tags.includes('light') || tags.includes('healthy') || name.includes('salad')) {
        chars.add('light');
        chars.add('healthy');
      }
      if (catSlug.includes('hummus-bowls')) {
        chars.add('healthy');
        chars.add('filling');
      }
      if (catSlug.includes('grill') || catSlug.includes('rice') || catSlug.includes('gravy') || name.includes('platter') || name.includes('mandi') || name.includes('kabsa') || name.includes('bomb')) {
        chars.add('filling');
        chars.add('rich');
      }
      if (catSlug.includes('dessert')) {
        chars.add('rich');
      }

      // 4. Meal Role
      if (catSlug.includes('soup') || catSlug.includes('salad') || catSlug.includes('mezze')) {
        role = 'starter';
      } else if (catSlug.includes('dessert')) {
        role = 'dessert';
      } else if (catSlug.includes('drinks') || catSlug.includes('beverage')) {
        role = 'beverage';
      } else if (catSlug.includes('rolls') || catSlug.includes('shawarma')) {
        role = 'snack';
      } else {
        role = 'main';
      }

      // 5. Ensure core ingredients are listed
      const currentIngredients = new Set((item.ingredients || []).map((i) => i.toLowerCase()));
      if (name.includes('chicken') || desc.includes('chicken')) currentIngredients.add('chicken');
      if (name.includes('lamb') || desc.includes('lamb') || name.includes('meat') || desc.includes('minced meat')) currentIngredients.add('lamb');
      if (name.includes('rice') || desc.includes('rice') || catSlug.includes('rice')) currentIngredients.add('rice');
      if (name.includes('hummus') || desc.includes('hummus') || desc.includes('chickpea')) currentIngredients.add('chickpeas');
      if (name.includes('eggplant') || desc.includes('eggplant')) currentIngredients.add('eggplant');
      if (name.includes('cheese') || desc.includes('cheese')) currentIngredients.add('cheese');

      item.flavours = Array.from(flavours);
      item.preparationMethods = Array.from(prep);
      item.characteristics = Array.from(chars);
      item.mealRole = role;
      item.ingredients = Array.from(currentIngredients).map(
        (str) => str.charAt(0).toUpperCase() + str.slice(1)
      );

      await item.save();
    }

    console.log('[Enrich] Successfully enriched all items in MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('[Enrich] Failed:', err);
    process.exit(1);
  }
};

enrichDatabase();
