const API_BASE = 'http://localhost:5000/api';

async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING AI FOOD ASSISTANT RECOMMENDATION ENGINE');
  console.log('====================================================\n');

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
    // ----------------------------------------------------
    // TEST A: "I want spicy chicken."
    // ----------------------------------------------------
    const resA = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'I want spicy chicken.',
      sessionId: 'test_session_A',
    });
    const dishesA = resA.data.dishes;
    const topA = dishesA[0];
    assert(
      dishesA.length > 0 &&
      dishesA.every((d) => !d.isVeg) &&
      topA.flavours?.includes('spicy'),
      'Test A: "I want spicy chicken."',
      `Top dish: ${topA?.name} (Veg: ${topA?.isVeg}, Flavours: ${topA?.flavours?.join(', ')})`
    );

    // ----------------------------------------------------
    // TEST B: "Only vegetarian food."
    // ----------------------------------------------------
    const resB = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Only vegetarian food.',
      sessionId: 'test_session_B',
    });
    const dishesB = resB.data.dishes;
    assert(
      dishesB.length > 0 && dishesB.every((d) => d.isVeg === true),
      'Test B: "Only vegetarian food."',
      `Returned ${dishesB.length} dishes, all isVeg = true (e.g. ${dishesB.map((d) => d.name).slice(0, 3).join(', ')})`
    );

    // ----------------------------------------------------
    // TEST C: "Something under ₹300."
    // ----------------------------------------------------
    const resC = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Something under ₹300.',
      sessionId: 'test_session_C',
    });
    const dishesC = resC.data.dishes;
    assert(
      dishesC.length > 0 && dishesC.every((d) => d.price <= 300),
      'Test C: "Something under ₹300."',
      `Returned ${dishesC.length} dishes, prices: ${dishesC.map((d) => `₹${d.price}`).join(', ')}`
    );

    // ----------------------------------------------------
    // TEST D: "I want grilled chicken under ₹500."
    // ----------------------------------------------------
    const resD = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'I want grilled chicken under ₹500.',
      sessionId: 'test_session_D',
    });
    const dishesD = resD.data.dishes;
    assert(
      dishesD.length > 0 &&
      dishesD.every((d) => !d.isVeg && d.price <= 500) &&
      dishesD.some((d) => d.preparationMethods?.includes('grilled')),
      'Test D: "I want grilled chicken under ₹500."',
      `Matches: ${dishesD.map((d) => `${d.name} (₹${d.price})`).join(', ')}`
    );

    // ----------------------------------------------------
    // TEST E: "I don't want rice."
    // ----------------------------------------------------
    const resE = await postJson(`${API_BASE}/public/assistant/message`, {
      message: "I don't want rice.",
      sessionId: 'test_session_E',
    });
    const dishesE = resE.data.dishes;
    const hasRice = dishesE.some((d) => /mandi|kabsa|rice|maqluba|biryani/i.test(d.name));
    assert(
      dishesE.length > 0 && !hasRice,
      'Test E: "I don\'t want rice." (Negative exclusion)',
      `Returned: ${dishesE.map((d) => d.name).join(', ')} (Zero rice dishes)`
    );

    // ----------------------------------------------------
    // TEST F: "Show me something similar to Chicken Mandi."
    // ----------------------------------------------------
    const resF = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Show me something similar to Chicken Mandi.',
      sessionId: 'test_session_F',
    });
    const dishesF = resF.data.dishes;
    const isSimilar = dishesF.some((d) => /mandi|kabsa|rice|bowl/i.test(d.name));
    assert(
      dishesF.length > 0 && isSimilar,
      'Test F: "Show me something similar to Chicken Mandi."',
      `Returned: ${dishesF.map((d) => d.name).join(', ')}`
    );

    // ----------------------------------------------------
    // TEST G: Multi-turn Sequence
    // ----------------------------------------------------
    const sessionG = 'test_session_multi_G_' + Date.now();
    await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'I want spicy food.',
      sessionId: sessionG,
    });

    await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Only chicken.',
      sessionId: sessionG,
    });

    const resG3 = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Under ₹400.',
      sessionId: sessionG,
    });

    const dishesG = resG3.data.dishes;
    const activePrefsG = resG3.data.activePreferences;
    const satisfiesG =
      dishesG.length > 0 &&
      dishesG.every((d) => !d.isVeg && d.price <= 400) &&
      activePrefsG.flavours?.includes('spicy') &&
      activePrefsG.ingredients?.includes('chicken') &&
      activePrefsG.maxPrice === 400;

    assert(
      satisfiesG,
      'Test G: Multi-turn sequence: "I want spicy food" -> "Only chicken" -> "Under ₹400"',
      `Active accumulated prefs: ${JSON.stringify(activePrefsG)} | Results: ${dishesG.map((d) => `${d.name} (₹${d.price})`).join(', ')}`
    );

    // ----------------------------------------------------
    // TEST H: "Show more"
    // ----------------------------------------------------
    const resH1 = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Show me grills.',
      sessionId: 'test_session_H',
    });
    const idsH1 = resH1.data.dishes.map((d) => d._id);

    const resH2 = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Show more',
      sessionId: 'test_session_H',
      action: 'more',
    });
    const idsH2 = resH2.data.dishes.map((d) => d._id);
    const hasDifferent = idsH2.some((id) => !idsH1.includes(id));

    assert(
      idsH2.length > 0 && hasDifferent,
      'Test H: "Show more" returns additional distinct recommendations',
      `Batch 1: ${resH1.data.dishes.map((d) => d.name).join(', ')} | Batch 2: ${resH2.data.dishes.map((d) => d.name).join(', ')}`
    );

    // ----------------------------------------------------
    // TEST I: Negative Feedback
    // ----------------------------------------------------
    const sessionI = 'test_session_I_' + Date.now();
    const resI1 = await postJson(`${API_BASE}/public/assistant/message`, {
      message: 'Show me chicken shawarma.',
      sessionId: sessionI,
    });
    const rejectedDish = resI1.data.dishes[0];

    const resI2 = await postJson(`${API_BASE}/public/assistant/message`, {
      message: "I don't like this.",
      sessionId: sessionI,
      action: 'feedback_negative',
      feedbackTargetDishId: rejectedDish?._id,
    });
    const dishesI2 = resI2.data.dishes;
    const isExcluded = !dishesI2.some((d) => d._id === rejectedDish?._id);

    assert(
      isExcluded,
      'Test I: Negative feedback "I don\'t like this" excludes rejected dish',
      `Rejected ${rejectedDish?.name}; subsequent results do not contain it.`
    );

    // ----------------------------------------------------
    // Summary
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed}/${total} SCENARIOS PASSED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();
