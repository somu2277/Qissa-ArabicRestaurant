const API_BASE = 'http://localhost:5000/api';

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function putJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function deleteJson(url, headers = {}) {
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 VERIFYING CATEGORY EXPERIENCE & NAVIGATION SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  };

  try {
    // 1. Check Public Categories
    console.log('1. Testing GET /api/public/categories...');
    const catRes = await getJson(`${API_BASE}/public/categories`);
    assert(catRes.status === 200, 'Categories endpoint returns 200 OK');
    const categories = catRes.data.data;
    assert(Array.isArray(categories), 'Categories is an array');
    assert(categories.length === 14, `Expected 14 categories, found: ${categories.length}`);

    // Verify all categories have dishCount > 0
    const zeroDishCats = categories.filter((c) => (c.dishCount || 0) === 0);
    assert(
      zeroDishCats.length === 0,
      `All 14 categories have mapped dishes (0 empty categories). Empty found: ${zeroDishCats.map((c) => c.name).join(', ')}`
    );

    categories.forEach((c) => {
      console.log(`   • ${c.name} (${c.slug}): ${c.dishCount} dishes`);
    });

    // 2. Check "Rolls & Pockets" specific verification
    console.log('\n2. Testing "Rolls & Pockets" category mapping...');
    const rollsCat = categories.find((c) => c.slug === 'rolls-pockets');
    assert(!!rollsCat, '"Rolls & Pockets" category exists');
    assert(rollsCat.dishCount >= 8, `"Rolls & Pockets" has at least 8 authentic dishes (found: ${rollsCat.dishCount})`);

    // 3. Test Category Dishes via Admin API
    console.log('\n3. Testing Admin Category Dishes...');
    const loginRes = await postJson(`${API_BASE}/admin/auth/login`, {
      email: 'admin@qissa.com',
      password: 'password123',
    });
    assert(loginRes.status === 200, 'Admin login succeeded');
    const token = loginRes.data.token;

    const dishesRes = await getJson(`${API_BASE}/admin/categories/${rollsCat._id}/dishes`, {
      Authorization: `Bearer ${token}`,
    });
    assert(dishesRes.status === 200, 'Fetched category dishes from admin API');
    assert(dishesRes.data.count >= 8, `Category dishes count matches (${dishesRes.data.count} items)`);
    console.log(`   Dishes in Rolls & Pockets: ${dishesRes.data.data.map((d) => d.name).join(', ')}`);

    // 4. Test Global Dietary Filtering
    console.log('\n4. Testing Global Dietary Filtering...');
    const vegMenuRes = await getJson(`${API_BASE}/public/menu?isVeg=true`);
    const vegItems = vegMenuRes.data.data;
    const allVeg = vegItems.every((i) => i.isVeg === true);
    assert(allVeg, 'Global Pure Veg filter returns strictly vegetarian items');
    assert(vegItems.length > 0, `Pure Veg items count: ${vegItems.length}`);

    const nonVegMenuRes = await getJson(`${API_BASE}/public/menu?isVeg=false`);
    const nonVegItems = nonVegMenuRes.data.data;
    const allNonVeg = nonVegItems.every((i) => i.isVeg === false);
    assert(allNonVeg, 'Global Non-Veg filter returns strictly non-vegetarian items');
    assert(nonVegItems.length > 0, `Non-Veg items count: ${nonVegItems.length}`);

    // 5. Test Category Reordering API
    console.log('\n5. Testing Category Reordering API...');
    const reorderPayload = [
      { id: categories[0]._id, sortOrder: 1 },
      { id: categories[1]._id, sortOrder: 2 },
    ];
    const reorderRes = await putJson(
      `${API_BASE}/admin/categories/reorder`,
      { items: reorderPayload },
      { Authorization: `Bearer ${token}` }
    );
    assert(reorderRes.status === 200, 'Reorder categories API succeeded');

    // 6. Test Delete Protection for Category with Dishes
    console.log('\n6. Testing Category Delete Protection...');
    const delRes = await deleteJson(`${API_BASE}/admin/categories/${rollsCat._id}`, {
      Authorization: `Bearer ${token}`,
    });
    assert(
      delRes.status === 400,
      `Blocked deletion of populated category with 400 Bad Request: "${delRes.data?.message}"`
    );

    console.log('\n========================================================');
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test suite encountered unexpected error:', error.message);
    process.exit(1);
  }
}

runTests();
