import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Fails fast on connection error so the process doesn't run in a broken state.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[db] Connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
