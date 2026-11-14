import mongoose from 'mongoose';
import { MenuItem } from '../models/MenuItem.js';
import { ENV } from '../config/env.js';

async function checkRolls() {
  await mongoose.connect(ENV.MONGODB_URI);
  const items = await MenuItem.find({
    name: { $regex: /roll|pocket|durum|sabich|samoon|musakhan/i },
  }).populate('categoryId').lean();

  console.log(`Found ${items.length} matching roll/pocket items:`);
  items.forEach((i) =>
    console.log(`- ${i.name} -> Category: "${i.categoryId?.name}" (${i.categoryId?.slug})`)
  );
  process.exit(0);
}

checkRolls();
