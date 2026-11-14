import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { MenuItem } from '../models/MenuItem.js';
import { ENV } from '../config/env.js';

async function audit() {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Audit] Connected to MongoDB Atlas');

    const categories = await Category.find().sort({ sortOrder: 1 }).lean();
    const items = await MenuItem.find().lean();

    console.log(`[Audit] Total Categories in DB: ${categories.length}`);
    console.log(`[Audit] Total Menu Items in DB: ${items.length}\n`);

    const catMap = new Map(categories.map((c) => [c._id.toString(), c]));
    const itemMap = new Map();
    let unmappedItems = [];
    let duplicateItems = [];
    const itemNames = new Set();

    for (const item of items) {
      if (itemNames.has(item.name.toLowerCase())) {
        duplicateItems.push(item.name);
      }
      itemNames.add(item.name.toLowerCase());

      const cId = item.categoryId?.toString();
      if (!cId || !catMap.has(cId)) {
        unmappedItems.push({ id: item._id, name: item.name, categoryId: cId });
      } else {
        const count = itemMap.get(cId) || 0;
        itemMap.set(cId, count + 1);
      }
    }

    console.log('--- CATEGORY BREAKDOWN ---');
    categories.forEach((cat) => {
      const count = itemMap.get(cat._id.toString()) || 0;
      console.log(
        `• ID: ${cat._id} | Name: "${cat.name}" | Slug: "${cat.slug}" | Active: ${cat.isActive} | Dishes: ${count} | Image: ${
          cat.image ? cat.image.substring(0, 45) + '...' : 'NONE'
        }`
      );
    });

    console.log('\n--- DATA ACCURACY AUDIT ---');
    console.log(`Unmapped Dishes: ${unmappedItems.length}`);
    if (unmappedItems.length > 0) {
      console.log('Unmapped details:', unmappedItems);
    }
    console.log(`Duplicate Dishes: ${duplicateItems.length}`);

    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  }
}

audit();
