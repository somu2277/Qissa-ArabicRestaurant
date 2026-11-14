import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/socketHandler.js';
import { errorHandler, notFound } from './middleware/error.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { seedDatabaseIfEmpty } from './seed/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// 1. Security Headers (allow cross-origin API calls)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

// 2. CORS - Allow all localhost, 127.0.0.1, and production frontends cleanly
const corsOptions = {
  origin: true, // Automatically mirrors caller origin for full local & prod compatibility
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-table-session',
    'X-Table-Session',
    'x-table-number',
    'X-Table-Number',
    'Origin',
  ],
  exposedHeaders: ['x-table-session', 'X-Table-Session'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Static uploads directory with database image fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/uploads/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    const { UploadedImage } = await import('./models/UploadedImage.js');
    
    // Look up in MongoDB Atlas by exact filename or common format variants
    let imageDoc = await UploadedImage.findOne({ filename });
    if (!imageDoc && filename.includes('.')) {
      const base = filename.substring(0, filename.lastIndexOf('.'));
      imageDoc = await UploadedImage.findOne({
        filename: { $regex: new RegExp(`^${base}\\.`, 'i') },
      });
    }

    if (imageDoc && imageDoc.data) {
      // Opportunistically cache to local disk
      try {
        const localPath = path.join(__dirname, '../uploads', filename);
        fs.promises.writeFile(localPath, imageDoc.data).catch(() => {});
      } catch (_) {}

      res.setHeader('Content-Type', imageDoc.mimeType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(imageDoc.data);
    }

    // High quality culinary fallback if an asset was deleted or never uploaded
    return res.redirect(302, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
  } catch (err) {
    next(err);
  }
});

// 5. Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
initSocket(io);

// 6. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Qissa Arabic Restaurant Backend',
    version: '1.0.0',
    mongodb: 'connected',
  });
});

// 7. API Routes
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// 8. Error Handling
app.use(notFound);
app.use(errorHandler);

// 9. Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabaseIfEmpty();

    server.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 QISSA RESTAURANT BACKEND RUNNING ON 0.0.0.0:${ENV.PORT}`);
      console.log(`📍 Public APIs: http://localhost:${ENV.PORT}/api/public`);
      console.log(`🔐 Admin APIs:  http://localhost:${ENV.PORT}/api/admin`);
      console.log(`⚡ Socket.IO initialized for real-time menu updates`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
