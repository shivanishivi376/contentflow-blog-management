import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';

dotenv.config();

export const migrateCategories = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/blog-app';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB for migration');
    }

    // 1. Drop old single-field unique index on slug if exists
    try {
      await Category.collection.dropIndex('slug_1');
      console.log('Dropped legacy Category slug_1 index');
    } catch {
      // index might not exist or already dropped
    }

    try {
      await Subcategory.collection.dropIndex('category_1_slug_1');
    } catch {}

    try {
      await Subcategory.collection.dropIndex('category_1_name_1');
    } catch {}

    // 2. Update legacy categories with missing scope
    const categoryUpdateResult = await Category.updateMany(
      { $or: [{ scope: { $exists: false } }, { scope: null }] },
      { $set: { scope: 'GLOBAL', createdByModel: 'Admin', team: null } }
    );
    console.log(`Migrated ${categoryUpdateResult.modifiedCount || 0} legacy categories to GLOBAL scope`);

    // 3. Update legacy subcategories with missing scope
    const subcategoryUpdateResult = await Subcategory.updateMany(
      { $or: [{ scope: { $exists: false } }, { scope: null }] },
      { $set: { scope: 'GLOBAL', createdByModel: 'Admin', team: null } }
    );
    console.log(`Migrated ${subcategoryUpdateResult.modifiedCount || 0} legacy subcategories to GLOBAL scope`);

    // 4. Ensure new indexes
    await Category.syncIndexes();
    await Subcategory.syncIndexes();
    console.log('Synchronized Category and Subcategory indexes');

    return {
      categoriesMigrated: categoryUpdateResult.modifiedCount || 0,
      subcategoriesMigrated: subcategoryUpdateResult.modifiedCount || 0
    };
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
};

if (process.argv[1]?.endsWith('migrateCategories.js')) {
  migrateCategories()
    .then(() => {
      console.log('Category and Subcategory migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}

export default migrateCategories;
