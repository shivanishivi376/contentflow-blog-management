import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import Admin from '../models/Admin.js';
import { hashPassword } from '../utils/password.js';

dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const assertRequiredEnvVars = () => {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

const seedMainAdmin = async () => {
  assertRequiredEnvVars();

  const name = process.env.ADMIN_NAME.trim();
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD);

  const existingAdmin = await Admin.findOne({ isMainAdmin: true });

  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.email = email;
    existingAdmin.password = hashedPassword;
    existingAdmin.isActive = true;
    existingAdmin.isMainAdmin = true;

    await existingAdmin.save();

    console.log(`Main admin updated for ${email}`);
    return;
  }

  await Admin.create({
    name,
    email,
    password: hashedPassword,
    isMainAdmin: true,
    isActive: true
  });

  console.log(`Main admin created for ${email}`);
};

const run = async () => {
  try {
    await connectDatabase(process.env.MONGODB_URI);
    await seedMainAdmin();
  } catch (error) {
    console.error('Admin seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
