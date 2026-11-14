import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = ENV.MONGODB_URI;

    if (!uri) {
      console.log('No MONGODB_URI provided in environment. Initializing local MongoDB memory server for development/testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`In-memory MongoDB instance ready at: ${uri}`);
    }

    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    // If external URI failed, fallback to in-memory for resilience
    if (!mongod && ENV.NODE_ENV !== 'production') {
      try {
        console.log('Falling back to MongoMemoryServer for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[MongoDB] Connected to in-memory fallback: ${uri}`);
        return conn;
      } catch (fallbackErr) {
        console.error('[MongoDB] Fallback also failed:', fallbackErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
