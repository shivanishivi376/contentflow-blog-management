import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from '../constants/permissions.js';
import Permission from '../models/Permission.js';
import Role from '../models/Role.js';

dotenv.config();

const seedPermissions = async () => {
  const permissionMap = new Map();

  for (const permission of DEFAULT_PERMISSIONS) {
    const record = await Permission.findOneAndUpdate(
      { code: permission.code },
      {
        code: permission.code,
        description: permission.description,
        isActive: true
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true
      }
    );

    permissionMap.set(permission.code, record._id);
    console.log(`Permission ready: ${permission.code}`);
  }

  return permissionMap;
};

const seedDefaultRoles = async (permissionMap) => {
  for (const role of DEFAULT_ROLES) {
    const permissionIds = role.permissionCodes
      .map((code) => permissionMap.get(code))
      .filter(Boolean);

    await Role.findOneAndUpdate(
      { slug: role.slug },
      {
        name: role.name,
        slug: role.slug,
        description: role.description,
        permissions: permissionIds,
        isDefault: true,
        isActive: true
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true
      }
    );

    console.log(`Default role ready: ${role.name}`);
  }
};

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing required environment variable: MONGODB_URI');
    }

    await connectDatabase(process.env.MONGODB_URI);
    const permissionMap = await seedPermissions();
    await seedDefaultRoles(permissionMap);
    console.log('RBAC seed completed successfully');
  } catch (error) {
    console.error('RBAC seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
