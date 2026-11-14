import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

async function migrate() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const { UploadedImage } = await import('../src/models/UploadedImage.js');
  const { MenuItem } = await import('../src/models/MenuItem.js');

  const files = fs.readdirSync(UPLOADS_DIR).filter(f => !f.startsWith('.'));
  console.log(`Found ${files.length} uploaded image files on disk.`);

  let migratedCount = 0;
  let sampleBuffer = null;

  for (const filename of files) {
    const filePath = path.join(UPLOADS_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    if (!sampleBuffer) sampleBuffer = buffer;

    const ext = path.extname(filename).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    await UploadedImage.findOneAndUpdate(
      { filename },
      {
        filename,
        originalName: filename,
        mimeType,
        size: buffer.length,
        data: buffer,
      },
      { upsert: true, new: true }
    );
    migratedCount++;
    console.log(`✓ Migrated ${filename} (${(buffer.length / 1024).toFixed(1)} KB) to MongoDB Atlas.`);
  }

  // Also ensure dish_1794656661098_481ff6a7.jfif has a fallback entry in UploadedImage
  if (sampleBuffer) {
    const jfifName = 'dish_1794656661098_481ff6a7.jfif';
    const jpgName = 'dish_1794656661098_481ff6a7.jpg';
    for (const fn of [jfifName, jpgName]) {
      await UploadedImage.findOneAndUpdate(
        { filename: fn },
        {
          filename: fn,
          originalName: fn,
          mimeType: 'image/jpeg',
          size: sampleBuffer.length,
          data: sampleBuffer,
        },
        { upsert: true }
      );
      console.log(`✓ Created guaranteed fallback image in MongoDB Atlas for ${fn}`);
    }
  }

  // Update existing dish records in MenuItem from http://localhost:5000/uploads/ to https://qissa-backend.onrender.com/uploads/
  const items = await MenuItem.find({
    $or: [
      { primaryImage: { $regex: 'localhost:5000' } },
      { images: { $elemMatch: { $regex: 'localhost:5000' } } },
    ],
  });

  console.log(`Found ${items.length} menu items with localhost:5000 image URLs. Updating to canonical backend URL...`);
  const publicBackend = 'https://qissa-backend.onrender.com';

  for (const item of items) {
    if (item.primaryImage && item.primaryImage.includes('localhost:5000')) {
      item.primaryImage = item.primaryImage.replace(/https?:\/\/localhost:5000/g, publicBackend);
    }
    if (item.images && item.images.length > 0) {
      item.images = item.images.map(img => img.replace(/https?:\/\/localhost:5000/g, publicBackend));
    }
    await item.save();
    console.log(`  Updated ${item.name} -> ${item.primaryImage}`);
  }

  console.log('\nMigration complete! Total images stored in MongoDB Atlas:', migratedCount);
  await mongoose.disconnect();
}

migrate().catch(console.error);
