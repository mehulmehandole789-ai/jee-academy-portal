import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jee_academy';

  try {
    // Attempt standard connection with 2.5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to database at: ${uri}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[MongoDB] Local MongoDB connection failed (${err.message}). Initializing embedded in-memory MongoDB fallback...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'jee_academy_memory',
        },
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Embedded MongoMemoryServer connected successfully at: ${memoryUri}`);
      return mongoose.connection;
    } catch (memErr) {
      console.error(`[MongoDB] Fatal error initializing embedded database:`, memErr);
      throw memErr;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (err) {
    console.error('[MongoDB] Disconnect error:', err);
  }
};
