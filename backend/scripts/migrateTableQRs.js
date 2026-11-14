import mongoose from 'mongoose';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
dotenv.config();

import { Table } from '../src/models/Table.js';
import { constructTableMenuUrl, getPublicCustomerMenuUrl } from '../src/config/env.js';

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const targetDomain = getPublicCustomerMenuUrl();
  console.log(`Target Public Customer Menu Domain: ${targetDomain}`);

  const tables = await Table.find().sort({ label: 1 });
  console.log(`Found ${tables.length} tables to verify and migrate.\n`);

  for (const table of tables) {
    const publicUrl = constructTableMenuUrl(table.qrToken);
    console.log(`Table ${table.label}:`);
    console.log(`  Token: ${table.qrToken} (PRESERVED)`);
    console.log(`  New Canonical Public URL: ${publicUrl}`);

    const newQR = await QRCode.toDataURL(publicUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
    });

    table.qrCodeDataUrl = newQR;
    await table.save();
    console.log(`  ✓ Updated qrCodeDataUrl with High-Res Public QR.\n`);
  }

  console.log('All table QR codes successfully migrated to public domain!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
