import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { MenuItem } from '../models/MenuItem.js';
import { ENV } from '../config/env.js';

const API_BASE = 'http://127.0.0.1:5000/api';

async function verifyAll() {
  console.log('========================================================');
  console.log('🧪 COMPREHENSIVE CATEGORY MAPPING & FILTERING TEST SUITE');
  console.log('========================================================\n');

  await mongoose.connect(ENV.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  const allDbItems = await MenuItem.find({ isActive: true }).lean();

  console.log(`Auditing ${categories.length} active categories and ${allDbItems.length} active menu items in DB...\n`);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition, msg) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      failedTests++;
    }
  };

  const resultsSummary = [];

  for (const cat of categories) {
    const catId = cat._id.toString();
    console.log(`\n────────────────────────────────────────────────────────`);
    console.log(`📂 Testing Category: "${cat.name}" (ID: ${catId}, Slug: ${cat.slug})`);
    console.log(`────────────────────────────────────────────────────────`);

    // Expected dishes from direct DB query
    const dbDishes = allDbItems.filter(i => (i.categoryId?._id || i.categoryId)?.toString() === catId);
    const dbVeg = dbDishes.filter(i => i.isVeg === true);
    const dbNonVeg = dbDishes.filter(i => i.isVeg === false);

    // 1. Fetch API for this category
    const res = await fetch(`${API_BASE}/public/menu?category=${catId}`);
    const data = await res.json();
    assert(res.ok && data.success, `API returned 200 OK for category ID ${catId}`);
    assert(data.count === dbDishes.length, `Count matches DB dishes: ${data.count} returned, ${dbDishes.length} in DB`);

    // 2. Verify all returned dishes belong ONLY to this category
    const anyMismatched = data.data.some(d => {
      const itemCatId = (d.categoryId?._id || d.categoryId)?.toString();
      return itemCatId !== catId;
    });
    assert(!anyMismatched, `Zero dishes from other categories leaked into "${cat.name}"`);

    // 3. Verify Shurba / Soup dishes do NOT leak into non-soup categories
    if (cat.slug !== 'shurba-soup') {
      const shurbaLeaked = data.data.some(d => 
        d.name.toLowerCase().includes('harira') || d.name.toLowerCase().includes('shurba')
      );
      assert(!shurbaLeaked, `No Shurba/Soup dishes appear in "${cat.name}"`);
    }

    // 4. Test Pure Veg filter
    const vegRes = await fetch(`${API_BASE}/public/menu?category=${catId}&isVeg=true`);
    const vegData = await vegRes.json();
    assert(vegRes.ok, `Pure Veg filter returned 200 OK`);
    assert(vegData.count === dbVeg.length, `Veg count matches (${vegData.count} veg dishes)`);
    const allStrictlyVeg = vegData.data.every(d => d.isVeg === true);
    assert(allStrictlyVeg, `All items under Veg filter are strictly vegetarian`);

    // 5. Test Non-Veg filter
    const nonVegRes = await fetch(`${API_BASE}/public/menu?category=${catId}&isVeg=false`);
    const nonVegData = await nonVegRes.json();
    assert(nonVegRes.ok, `Non-Veg filter returned 200 OK`);
    assert(nonVegData.count === dbNonVeg.length, `Non-Veg count matches (${nonVegData.count} non-veg dishes)`);
    const allStrictlyNonVeg = nonVegData.data.every(d => d.isVeg === false);
    assert(allStrictlyNonVeg, `All items under Non-Veg filter are strictly non-vegetarian`);

    // Record for final table
    resultsSummary.push({
      category: cat.name,
      id: catId,
      totalDishes: dbDishes.length,
      vegDishes: dbVeg.length,
      nonVegDishes: dbNonVeg.length,
      status: 'VERIFIED_ACCURATE',
    });
  }

  // 6. Test Slug support
  console.log(`\n────────────────────────────────────────────────────────`);
  console.log(`🔍 Testing Slug Lookup on API`);
  console.log(`────────────────────────────────────────────────────────`);
  const slugRes = await fetch(`${API_BASE}/public/menu?category=sulta-salads`);
  const slugData = await slugRes.json();
  assert(slugRes.ok && slugData.success, `API supports category slug "sulta-salads"`);
  assert(slugData.count === 5, `Returned 5 salad dishes when queried by slug`);

  // 7. Test All Categories view
  console.log(`\n────────────────────────────────────────────────────────`);
  console.log(`🌐 Testing All Categories API Query`);
  console.log(`────────────────────────────────────────────────────────`);
  const allRes = await fetch(`${API_BASE}/public/menu`);
  const allData = await allRes.json();
  assert(allRes.ok && allData.count === allDbItems.length, `All menu items query returns all ${allDbItems.length} active dishes`);

  console.log('\n========================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================================\n');

  console.table(resultsSummary);

  await mongoose.disconnect();
  process.exit(failedTests > 0 ? 1 : 0);
}

verifyAll().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
