import mongoose from 'mongoose';
import { io } from '../../../customer/node_modules/socket.io-client/build/esm/index.js';
import { Category } from '../models/Category.js';
import { MenuItem } from '../models/MenuItem.js';
import { ENV } from '../config/env.js';

const API_BASE = 'http://127.0.0.1:5000/api';

async function testSync() {
  console.log('========================================================');
  console.log('⚡ TESTING REAL-TIME ADMIN CATEGORY SYNC');
  console.log('========================================================\n');

  await mongoose.connect(ENV.MONGODB_URI);

  // 1. Admin Login
  const loginRes = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@qissa.com', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error('Admin login failed');
  const token = loginData.token;
  console.log('✅ 1. Admin login authenticated successfully');

  // Find two categories: e.g. "Cold Mezze" and "Hot Mezze"
  const coldMezze = await Category.findOne({ slug: 'cold-mezze' }).lean();
  const hotMezze = await Category.findOne({ slug: 'hot-mezze' }).lean();

  // Find a test item in Cold Mezze
  const testItem = await MenuItem.findOne({ name: 'Labneh with Zaatar & Olives' });
  const originalCatId = testItem.categoryId.toString();
  console.log(`✅ 2. Target item found: "${testItem.name}", original categoryId: ${originalCatId} (Cold Mezze)`);

  // Connect client socket to listen for real-time broadcasts
  const socket = io('http://127.0.0.1:5000');
  let menuUpdateReceived = false;
  let categoryUpdateReceived = false;

  socket.on('menu:updated', (payload) => {
    console.log('   [Socket Event] menu:updated received:', payload.action);
    menuUpdateReceived = true;
  });

  socket.on('category:updated', (payload) => {
    console.log('   [Socket Event] category:updated received:', payload.action);
    categoryUpdateReceived = true;
  });

  // Wait for socket connection
  await new Promise((resolve) => socket.on('connect', resolve));
  console.log('✅ 3. Test client connected to Socket.IO stream');

  // 4. Admin moves item to Hot Mezze
  const updateRes = await fetch(`${API_BASE}/admin/menu/${testItem._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ categoryId: hotMezze._id.toString() }),
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok) throw new Error('Admin item update failed');
  console.log(`✅ 4. Admin API updated dish category to Hot Mezze (${hotMezze._id})`);

  // Wait 1.5 seconds for socket event propagation
  await new Promise((r) => setTimeout(r, 1500));

  if (!menuUpdateReceived) throw new Error('menu:updated socket event was not emitted!');
  if (!categoryUpdateReceived) throw new Error('category:updated socket event was not emitted!');
  console.log('✅ 5. Socket.IO broadcast confirmed: both menu:updated and category:updated received');

  // Verify in DB
  const itemInDb = await MenuItem.findById(testItem._id).lean();
  if (itemInDb.categoryId.toString() !== hotMezze._id.toString()) {
    throw new Error('Database categoryId does not match Hot Mezze!');
  }
  console.log('✅ 6. Verified in MongoDB Atlas: item categoryId updated to Hot Mezze');

  // 7. Restore original category
  const restoreRes = await fetch(`${API_BASE}/admin/menu/${testItem._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ categoryId: originalCatId }),
  });
  const restoreData = await restoreRes.json();
  if (!restoreRes.ok) throw new Error('Admin item restore failed');
  console.log(`✅ 7. Restored item back to original category Cold Mezze (${originalCatId})`);

  socket.disconnect();
  await mongoose.disconnect();

  console.log('\n========================================================');
  console.log('🎉 REAL-TIME SYNCHRONIZATION TEST: 100% SUCCESS');
  console.log('========================================================\n');
  process.exit(0);
}

testSync().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
