import fs from 'fs';

async function run() {
  console.log('Testing Admin Login...');
  const loginRes = await fetch('http://127.0.0.1:5000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@qissa.com', password: 'password123' }),
  }).then((r) => r.json());

  if (!loginRes.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes));
  }
  const token = loginRes.token;
  console.log('✅ Admin login succeeded, token acquired');

  // Test translations
  const testDishes = ['Chicken Mandi', 'Chicken Shawarma', 'Lentil Soup', 'Fattoush', 'Chicken Kebab'];
  console.log('\nTesting Automatic Arabic Translations:');
  for (const dish of testDishes) {
    const trRes = await fetch('http://127.0.0.1:5000/api/admin/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ text: dish }),
    }).then((r) => r.json());

    console.log(`  👉 "${dish}" -> "${trRes.data?.arabicName}" (Source: ${trRes.data?.source})`);
  }

  // Test image upload
  console.log('\nTesting Image Upload endpoint...');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  // 1x1 transparent PNG
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(pngBase64, 'base64');

  const multipartBody = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="sample_food.png"\r\nContent-Type: image/png\r\n\r\n`),
    pngBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const uploadRes = await fetch('http://127.0.0.1:5000/api/admin/upload-image', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: multipartBody,
  }).then((r) => r.json());

  console.log('Upload Response:', uploadRes);
  if (uploadRes.success && uploadRes.data?.url) {
    console.log('✅ Image Upload Succeeded! URL:', uploadRes.data.url);
  } else {
    throw new Error('Image upload failed: ' + JSON.stringify(uploadRes));
  }
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
