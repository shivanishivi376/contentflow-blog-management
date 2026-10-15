import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(mongoUri);
   console.log('MongoDB connected successfully');

  return mongoose.connection;
};
