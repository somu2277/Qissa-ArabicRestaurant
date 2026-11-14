const API_BASE = 'http://localhost:5000/api';

async function runRatingTests() {
  console.log('========================================================');
  console.log('⭐ TESTING TABLE-WISE CUSTOMER FOOD RATINGS SYSTEM');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, title, details = '') => {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      if (details) console.log(`   👉 ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (details) console.error(`   👉 ${details}`);
    }
  };

  try {
    // --------------------------------------------------------
    // SETUP: Get Admin Token and Active Table QR Token
    // --------------------------------------------------------
    const loginRes = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@qissa.com', password: 'password123' }),
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.token;

    const tablesRes = await fetch(`${API_BASE}/admin/tables`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const tablesData = await tablesRes.json();
    const tableT02 = tablesData.data.find((t) => t.label === 'T02') || tablesData.data[0];

    // Find "Chicken Mandi" dish
    const menuRes = await fetch(`${API_BASE}/public/menu`);
    const menuData = await menuRes.json();
    const chickenMandi = menuData.data.find((item) => item.name.includes('Mandi')) || menuData.data[0];
    const secondDish = menuData.data.find((item) => item._id !== chickenMandi._id);

    // --------------------------------------------------------
    // SCENARIO 1: Customer enters through Table QR code
    // Expected: Validates table QR, generates anonymous session token
    // --------------------------------------------------------
    const qrScanRes = await fetch(`${API_BASE}/public/tables/${tableT02.qrToken}`);
    const qrScanData = await qrScanRes.json();
    const sessionToken = qrScanData.data?.sessionToken;

    assert(
      qrScanRes.status === 200 && qrScanData.success && !!sessionToken,
      'Scenario 1: Scan table QR and generate anonymous session',
      `Table ${qrScanData.data?.label} (${qrScanData.data?.location}), Session Token: ${sessionToken?.substring(0, 12)}...`
    );

    // --------------------------------------------------------
    // SCENARIO 2 & 3: Submit 5-star rating on Chicken Mandi
    // Expected: 200 OK, average rating and total ratings update
    // --------------------------------------------------------
    const initialStatsRes = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`);
    const initialStats = await initialStatsRes.json();
    const prevCount = initialStats.data?.totalRatings || 0;

    const rateRes = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-table-session': sessionToken,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    const rateData = await rateRes.json();

    assert(
      rateRes.status === 200 &&
      rateData.success &&
      rateData.data.userRating === 5 &&
      rateData.data.totalRatings === prevCount + 1,
      'Scenarios 2 & 3: Submit 5-star rating & verify count/average update',
      `Message: "${rateData.message}", New Avg: ${rateData.data.averageRating}★, Total: ${rateData.data.totalRatings}`
    );

    // --------------------------------------------------------
    // SCENARIO 4 & 5: Rate the same dish again from the same session
    // Expected: Updated, NOT duplicated (totalRatings must not increment!)
    // --------------------------------------------------------
    const rateAgainRes = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-table-session': sessionToken,
      },
      body: JSON.stringify({ rating: 4 }),
    });
    const rateAgainData = await rateAgainRes.json();

    assert(
      rateAgainRes.status === 200 &&
      rateAgainData.data.isUpdate === true &&
      rateAgainData.data.userRating === 4 &&
      rateAgainData.data.totalRatings === rateData.data.totalRatings,
      'Scenarios 4 & 5: Re-rating updates existing rating without duplicate count',
      `Updated to 4★. IsUpdate: ${rateAgainData.data.isUpdate}, Count remained: ${rateAgainData.data.totalRatings}`
    );

    // --------------------------------------------------------
    // SCENARIO 6: Attempt rating without table session
    // Expected: 401 Unauthorized
    // --------------------------------------------------------
    const unauthRateRes = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5 }),
    });

    assert(
      unauthRateRes.status === 401,
      'Scenario 6: Attempt rating without valid table session is rejected',
      `Status: ${unauthRateRes.status} (Rejected non-table visitor)`
    );

    // --------------------------------------------------------
    // SCENARIO 7: Attempt invalid ratings (0 or 6 stars)
    // Expected: 400 Bad Request
    // --------------------------------------------------------
    const invalidRateRes1 = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-table-session': sessionToken,
      },
      body: JSON.stringify({ rating: 6 }),
    });
    const invalidRateRes2 = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-table-session': sessionToken,
      },
      body: JSON.stringify({ rating: 0 }),
    });

    assert(
      invalidRateRes1.status === 400 && invalidRateRes2.status === 400,
      'Scenario 7: Invalid star values (0 or 6) rejected with 400',
      `Rating 6: Status ${invalidRateRes1.status}, Rating 0: Status ${invalidRateRes2.status}`
    );

    // --------------------------------------------------------
    // SCENARIO 8: Attempt rating with a fake/expired session token
    // Expected: 401 / 403 Forbidden
    // --------------------------------------------------------
    const fakeTokenRes = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-table-session': 'fake_unrecognized_session_token_xyz',
      },
      body: JSON.stringify({ rating: 5 }),
    });

    assert(
      fakeTokenRes.status === 401,
      'Scenario 8: Fake/invalid table session token rejected',
      `Status: ${fakeTokenRes.status}`
    );

    // --------------------------------------------------------
    // SCENARIO 9: Rate a different dish during the same table session
    // Expected: Succeeds independently
    // --------------------------------------------------------
    const secondRateRes = await fetch(`${API_BASE}/public/menu/${secondDish._id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-table-session': sessionToken,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    const secondRateData = await secondRateRes.json();

    assert(
      secondRateRes.status === 200 && secondRateData.success,
      'Scenario 9: Rate a different dish in same session succeeds',
      `Rated ${secondDish.name}: ${secondRateData.data.userRating}★`
    );

    // --------------------------------------------------------
    // SCENARIO 10: Confirm ratings appear in public menu items
    // Expected: menuItem.averageRating and menuItem.totalRatings reflect in API
    // --------------------------------------------------------
    const updatedMenuRes = await fetch(`${API_BASE}/public/menu`);
    const updatedMenuData = await updatedMenuRes.json();
    const updatedMandi = updatedMenuData.data.find((item) => item._id === chickenMandi._id);

    assert(
      updatedMandi && updatedMandi.totalRatings > 0 && updatedMandi.averageRating > 0,
      'Scenario 10: Ratings appear in public menu item list',
      `${updatedMandi?.name} -> ${updatedMandi?.averageRating}★ (${updatedMandi?.totalRatings} ratings)`
    );

    // --------------------------------------------------------
    // SCENARIO 11: Confirm ratings details API returns userRating for active session
    // --------------------------------------------------------
    const detailsRes = await fetch(`${API_BASE}/public/menu/${chickenMandi._id}/ratings`, {
      headers: { 'x-table-session': sessionToken },
    });
    const detailsData = await detailsRes.json();

    assert(
      detailsRes.status === 200 && detailsData.data.userRating === 4,
      'Scenario 11: Dish ratings details endpoint returns user previous rating',
      `User rating recognized: ${detailsData.data.userRating}★, Dish Avg: ${detailsData.data.averageRating}★`
    );

    // --------------------------------------------------------
    // SCENARIO 12: Admin Ratings Management Statistics
    // Expected: Admin stats show total ratings, highest/lowest rated dishes
    // --------------------------------------------------------
    const adminStatsRes = await fetch(`${API_BASE}/admin/ratings/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();

    assert(
      adminStatsRes.status === 200 &&
      adminStatsData.data.totalRatings >= 2 &&
      adminStatsData.data.highestRated.length > 0,
      'Scenario 12: Admin dashboard ratings statistics & audit stream',
      `Admin Total Ratings: ${adminStatsData.data.totalRatings}, Highest: ${adminStatsData.data.highestRated[0]?.name} (${adminStatsData.data.highestRated[0]?.averageRating}★)`
    );

    // --------------------------------------------------------
    // SCENARIO 13: Existing QR and Table functionality unaffected
    // --------------------------------------------------------
    const tableCheckRes = await fetch(`${API_BASE}/public/tables/${tableT02.qrToken}`);
    const tableCheckData = await tableCheckRes.json();

    assert(
      tableCheckRes.status === 200 && tableCheckData.data.label === tableT02.label,
      'Scenario 13: Existing table QR routing & details completely intact',
      `Table Label: ${tableCheckData.data.label}, Location: ${tableCheckData.data.location}`
    );

    // --------------------------------------------------------
    // SCENARIO 14: Food Assistant Chatbot remains 100% operational
    // --------------------------------------------------------
    const assistantRes = await fetch(`${API_BASE}/public/assistant/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want spicy chicken under 500' }),
    });
    const assistantData = await assistantRes.json();

    assert(
      assistantRes.status === 200 && assistantData.data.dishes.length > 0,
      'Scenario 14: Food Assistant Chatbot remains unaffected & operational',
      `Top recommended: ${assistantData.data.dishes[0]?.name}`
    );

    console.log('\n========================================================');
    console.log(`📊 FINAL RATING TEST RESULTS: ${passed}/${total} SCENARIOS PASSED`);
    console.log('========================================================\n');
  } catch (err) {
    console.error('Fatal rating test error:', err);
  }
}

runRatingTests();
