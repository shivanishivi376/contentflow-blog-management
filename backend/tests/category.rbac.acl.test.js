import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import AppError from '../src/utils/AppError.js';
import Category from '../src/models/Category.js';
import Subcategory from '../src/models/Subcategory.js';
import Blog from '../src/models/Blog.js';
import Keyword from '../src/models/Keyword.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from '../src/services/categoryService.js';
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory
} from '../src/services/subcategoryService.js';
import { validateTaxonomyHierarchy } from '../src/services/blogService.js';

test('RBAC & ACL - Category & Subcategory Flow', async (t) => {
  const adminActor = {
    type: 'ADMIN',
    id: new mongoose.Types.ObjectId().toString(),
    isMainAdmin: true
  };

  const userA_Id = new mongoose.Types.ObjectId().toString();
  const userA_Actor = {
    type: 'USER',
    id: userA_Id,
    accountType: 'INDIVIDUAL',
    teamMembership: null
  };

  const userB_Id = new mongoose.Types.ObjectId().toString();
  const userB_Actor = {
    type: 'USER',
    id: userB_Id,
    accountType: 'INDIVIDUAL',
    teamMembership: null
  };

  const team1_Id = new mongoose.Types.ObjectId().toString();
  const teamCaptain_Id = new mongoose.Types.ObjectId().toString();
  const teamCaptain_Actor = {
    type: 'USER',
    id: teamCaptain_Id,
    accountType: 'TEAM',
    teamMembership: {
      teamId: team1_Id,
      workflowRole: 'Writer',
      isOwner: true
    }
  };

  const teamMember1_Id = new mongoose.Types.ObjectId().toString();
  const teamMember1_Actor = {
    type: 'USER',
    id: teamMember1_Id,
    accountType: 'TEAM',
    teamMembership: {
      teamId: team1_Id,
      workflowRole: 'Reviewer',
      isOwner: false
    }
  };

  const team2_Id = new mongoose.Types.ObjectId().toString();
  const team2Member_Id = new mongoose.Types.ObjectId().toString();
  const team2Member_Actor = {
    type: 'USER',
    id: team2Member_Id,
    accountType: 'TEAM',
    teamMembership: {
      teamId: team2_Id,
      workflowRole: 'Writer',
      isOwner: false
    }
  };

  // Mock DB stores in memory for testing
  const categoriesDB = [];
  const subcategoriesDB = [];
  const keywordsDB = [];
  const blogsDB = [];

  // Monkey-patch repository / Mongoose methods for unit test isolation
  const origCategoryFind = Category.find;
  const origCategoryFindById = Category.findById;
  const origCategoryFindOne = Category.findOne;
  const origCategoryCreate = Category.create;
  const origCategoryFindByIdAndUpdate = Category.findByIdAndUpdate;
  const origCategoryFindByIdAndDelete = Category.findByIdAndDelete;

  const origSubcategoryFind = Subcategory.find;
  const origSubcategoryFindById = Subcategory.findById;
  const origSubcategoryFindOne = Subcategory.findOne;
  const origSubcategoryCreate = Subcategory.create;
  const origSubcategoryFindByIdAndUpdate = Subcategory.findByIdAndUpdate;
  const origSubcategoryFindByIdAndDelete = Subcategory.findByIdAndDelete;
  const origSubcategoryDeleteMany = Subcategory.deleteMany;

  const origKeywordDeleteMany = Keyword.deleteMany;
  const origKeywordFind = Keyword.find;
  const origBlogExists = Blog.exists;

  // Helper to mock mongoose query chaining (.populate().sort())
  const createMockQuery = (result) => {
    const query = {
      populate: () => query,
      sort: () => query,
      lean: () => Promise.resolve(result),
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
      catch: (reject) => Promise.resolve(result).catch(reject)
    };
    return query;
  };

  Category.find = (filter = {}) => {
    let list = [...categoriesDB];
    if (filter.$or) {
      list = list.filter((item) => {
        return filter.$or.some((cond) => {
          if (cond.scope === 'GLOBAL' && item.scope === 'GLOBAL') return true;
          if (cond.scope?.$exists === false && !item.scope) return true;
          if (cond.scope === 'TEAM' && item.scope === 'TEAM' && String(item.team) === String(cond.team)) return true;
          if (cond.scope === 'INDIVIDUAL' && item.scope === 'INDIVIDUAL' && String(item.createdBy) === String(cond.createdBy)) return true;
          return false;
        });
      });
    }
    return createMockQuery(list);
  };

  Category.findById = (id) => {
    const item = categoriesDB.find((c) => String(c._id) === String(id));
    return createMockQuery(item || null);
  };

  Category.findOne = (filter) => {
    let item = categoriesDB.find((c) => {
      if (filter.slug && c.slug !== filter.slug) return false;
      if (filter.name && filter.name instanceof RegExp && !filter.name.test(c.name)) return false;
      if (filter.scope && c.scope !== filter.scope) return false;
      if (filter.team && String(c.team) !== String(filter.team)) return false;
      if (filter.createdBy && String(c.createdBy) !== String(filter.createdBy)) return false;
      return true;
    });
    return Promise.resolve(item || null);
  };

  Category.create = (doc) => {
    const newDoc = {
      _id: new mongoose.Types.ObjectId().toString(),
      isActive: true,
      ...doc
    };
    categoriesDB.push(newDoc);
    return Promise.resolve(newDoc);
  };

  Category.findByIdAndUpdate = (id, update) => {
    const idx = categoriesDB.findIndex((c) => String(c._id) === String(id));
    if (idx !== -1) {
      categoriesDB[idx] = { ...categoriesDB[idx], ...update };
      return createMockQuery(categoriesDB[idx]);
    }
    return createMockQuery(null);
  };

  Category.findByIdAndDelete = (id) => {
    const idx = categoriesDB.findIndex((c) => String(c._id) === String(id));
    if (idx !== -1) {
      const deleted = categoriesDB.splice(idx, 1)[0];
      return Promise.resolve(deleted);
    }
    return Promise.resolve(null);
  };

  Subcategory.find = (filter = {}) => {
    let list = [...subcategoriesDB];
    if (filter.category) {
      list = list.filter((s) => String(s.category?._id || s.category) === String(filter.category));
    }
    if (filter.$or) {
      list = list.filter((item) => {
        return filter.$or.some((cond) => {
          if (cond.scope === 'GLOBAL' && item.scope === 'GLOBAL') return true;
          if (cond.scope?.$exists === false && !item.scope) return true;
          if (cond.scope === 'TEAM' && item.scope === 'TEAM' && String(item.team) === String(cond.team)) return true;
          if (cond.scope === 'INDIVIDUAL' && item.scope === 'INDIVIDUAL' && String(item.createdBy) === String(cond.createdBy)) return true;
          return false;
        });
      });
    }
    return createMockQuery(list);
  };

  Subcategory.findById = (id) => {
    const item = subcategoriesDB.find((s) => String(s._id) === String(id));
    return createMockQuery(item || null);
  };

  Subcategory.findOne = (filter) => {
    let item = subcategoriesDB.find((s) => {
      if (filter.category && String(s.category?._id || s.category) !== String(filter.category)) return false;
      if (filter.slug && s.slug !== filter.slug) return false;
      if (filter.name && filter.name instanceof RegExp && !filter.name.test(s.name)) return false;
      if (filter.scope && s.scope !== filter.scope) return false;
      if (filter.team && String(s.team) !== String(filter.team)) return false;
      if (filter.createdBy && String(s.createdBy) !== String(filter.createdBy)) return false;
      return true;
    });
    return Promise.resolve(item || null);
  };

  Subcategory.create = (doc) => {
    const newDoc = {
      _id: new mongoose.Types.ObjectId().toString(),
      isActive: true,
      ...doc
    };
    subcategoriesDB.push(newDoc);
    return Promise.resolve(newDoc);
  };

  Subcategory.findByIdAndUpdate = (id, update) => {
    const idx = subcategoriesDB.findIndex((s) => String(s._id) === String(id));
    if (idx !== -1) {
      subcategoriesDB[idx] = { ...subcategoriesDB[idx], ...update };
      return createMockQuery(subcategoriesDB[idx]);
    }
    return createMockQuery(null);
  };

  Subcategory.findByIdAndDelete = (id) => {
    const idx = subcategoriesDB.findIndex((s) => String(s._id) === String(id));
    if (idx !== -1) {
      const deleted = subcategoriesDB.splice(idx, 1)[0];
      return Promise.resolve(deleted);
    }
    return Promise.resolve(null);
  };

  Subcategory.deleteMany = (filter) => {
    const initialLen = subcategoriesDB.length;
    for (let i = subcategoriesDB.length - 1; i >= 0; i--) {
      if (filter.category && String(subcategoriesDB[i].category) === String(filter.category)) {
        subcategoriesDB.splice(i, 1);
      }
    }
    return Promise.resolve({ deletedCount: initialLen - subcategoriesDB.length });
  };

  Keyword.deleteMany = (filter) => {
    const initialLen = keywordsDB.length;
    for (let i = keywordsDB.length - 1; i >= 0; i--) {
      if (filter.category && String(keywordsDB[i].category) === String(filter.category)) {
        keywordsDB.splice(i, 1);
      }
      if (filter.subcategory && String(keywordsDB[i].subcategory) === String(filter.subcategory)) {
        keywordsDB.splice(i, 1);
      }
    }
    return Promise.resolve({ deletedCount: initialLen - keywordsDB.length });
  };

  Keyword.find = () => Promise.resolve([]);
  Blog.exists = (filter) => {
    const exists = blogsDB.some((b) => {
      if (filter.category && String(b.category) === String(filter.category)) return true;
      if (filter.subcategory && String(b.subcategory) === String(filter.subcategory)) return true;
      return false;
    });
    return Promise.resolve(exists ? { _id: 'blog123' } : null);
  };

  await t.test('1. Admin creates global category and global subcategory', async () => {
    const globalCat = await createCategory({ name: 'General Tech', description: 'Global tech category' }, adminActor);
    assert.equal(globalCat.name, 'General Tech');
    assert.equal(globalCat.scope, 'GLOBAL');
    assert.equal(globalCat.canEdit, true);
    assert.equal(globalCat.canDelete, true);

    const globalSub = await createSubcategory(
      { categoryId: globalCat._id, name: 'Web Dev', description: 'Global web dev' },
      adminActor
    );
    assert.equal(globalSub.name, 'Web Dev');
    assert.equal(globalSub.scope, 'GLOBAL');
    assert.equal(globalSub.canEdit, true);
    assert.equal(globalSub.canDelete, true);
  });

  await t.test('2. Normal user A creates individual category & subcategory', async () => {
    const userCat = await createCategory({ name: 'My AI Notes', description: 'User A personal category' }, userA_Actor);
    assert.equal(userCat.name, 'My AI Notes');
    assert.equal(userCat.scope, 'INDIVIDUAL');
    assert.equal(userCat.isOwner, true);
    assert.equal(userCat.canEdit, true);
    assert.equal(userCat.canDelete, true);

    // Subcategory under their own category
    const userSub = await createSubcategory(
      { categoryId: userCat._id, name: 'Prompt Engineering', description: 'AI subcategory' },
      userA_Actor
    );
    assert.equal(userSub.name, 'Prompt Engineering');
    assert.equal(userSub.scope, 'INDIVIDUAL');
    assert.equal(userSub.isOwner, true);
    assert.equal(userSub.canEdit, true);
    assert.equal(userSub.canDelete, true);
  });

  await t.test('3. Normal user A can create subcategory under GLOBAL category', async () => {
    const globalCat = categoriesDB.find((c) => c.name === 'General Tech');
    const userSubUnderGlobal = await createSubcategory(
      { categoryId: globalCat._id, name: 'Node.js Deep Dive', description: 'User A custom subcategory under global' },
      userA_Actor
    );
    assert.equal(userSubUnderGlobal.name, 'Node.js Deep Dive');
    assert.equal(userSubUnderGlobal.scope, 'INDIVIDUAL');
    assert.equal(userSubUnderGlobal.isOwner, true);
    assert.equal(userSubUnderGlobal.canEdit, true);
  });

  await t.test('4. Normal user B cannot see or edit user A private category/subcategory', async () => {
    const categoriesForB = await getCategories(userB_Actor);
    const hasUserACat = categoriesForB.some((c) => c.name === 'My AI Notes');
    assert.equal(hasUserACat, false, 'User B must not see User A personal category');

    const userCatA = categoriesDB.find((c) => c.name === 'My AI Notes');

    // Attempt edit
    await assert.rejects(
      () => updateCategory(userCatA._id, { name: 'Hacked Category' }, userB_Actor),
      /You can only edit categories you personally created|FORBIDDEN/
    );

    // Attempt delete
    await assert.rejects(
      () => deleteCategory(userCatA._id, userB_Actor),
      /You can only delete categories you personally created|FORBIDDEN/
    );

    // Attempt create subcategory under User A private category
    await assert.rejects(
      () => createSubcategory({ categoryId: userCatA._id, name: 'Hacked Sub' }, userB_Actor),
      /Cannot use category created by another user|FORBIDDEN/
    );
  });

  await t.test('5. Normal user cannot edit or delete global/admin categories', async () => {
    const globalCat = categoriesDB.find((c) => c.name === 'General Tech');
    await assert.rejects(
      () => updateCategory(globalCat._id, { name: 'Altered Global' }, userA_Actor),
      /Cannot edit global or admin-created categories|FORBIDDEN/
    );

    await assert.rejects(
      () => deleteCategory(globalCat._id, userA_Actor),
      /Cannot delete global or admin-created categories|FORBIDDEN/
    );
  });

  await t.test('6. Team members (Writer, Reviewer) can create team categories & subcategories', async () => {
    // Team member 1 (Reviewer role) creates category
    const teamCat1 = await createCategory(
      { name: 'Team Architecture', description: 'Team 1 Architecture' },
      teamMember1_Actor
    );
    assert.equal(teamCat1.name, 'Team Architecture');
    assert.equal(teamCat1.scope, 'TEAM');
    assert.equal(String(teamCat1.team), team1_Id);
    assert.equal(teamCat1.isOwner, true);
    assert.equal(teamCat1.canEdit, true);
    assert.equal(teamCat1.canDelete, true);

    // Team captain creates subcategory under team category
    const teamSub1 = await createSubcategory(
      { categoryId: teamCat1._id, name: 'Microservices', description: 'Microservices sub' },
      teamCaptain_Actor
    );
    assert.equal(teamSub1.name, 'Microservices');
    assert.equal(teamSub1.scope, 'TEAM');
    assert.equal(teamSub1.isOwner, true);
    assert.equal(teamSub1.canEdit, true);
  });

  await t.test('7. Team captain cannot edit/delete category created by team member', async () => {
    const memberCat = categoriesDB.find((c) => c.name === 'Team Architecture');
    assert.equal(String(memberCat.createdBy), teamMember1_Id);

    // Captain tries to edit member's category
    await assert.rejects(
      () => updateCategory(memberCat._id, { name: 'Captain Hijacked' }, teamCaptain_Actor),
      /You can only edit categories you personally created|FORBIDDEN/
    );

    // Captain tries to delete member's category
    await assert.rejects(
      () => deleteCategory(memberCat._id, teamCaptain_Actor),
      /You can only delete categories you personally created|FORBIDDEN/
    );
  });

  await t.test('8. Team member cannot edit/delete subcategory created by captain', async () => {
    const captainSub = subcategoriesDB.find((s) => s.name === 'Microservices');
    assert.equal(String(captainSub.createdBy), teamCaptain_Id);

    // Member tries to edit captain's subcategory
    await assert.rejects(
      () => updateSubcategory(captainSub._id, { categoryId: captainSub.category, name: 'Member Hijacked' }, teamMember1_Actor),
      /You can only edit subcategories you personally created|FORBIDDEN/
    );

    // Member tries to delete captain's subcategory
    await assert.rejects(
      () => deleteSubcategory(captainSub._id, teamMember1_Actor),
      /You can only delete subcategories you personally created|FORBIDDEN/
    );
  });

  await t.test('9. Team 2 members cannot see or modify Team 1 categories/subcategories', async () => {
    const team1Cat = categoriesDB.find((c) => c.name === 'Team Architecture');

    // Team 2 member tries to edit
    await assert.rejects(
      () => updateCategory(team1Cat._id, { name: 'Team 2 Hacked' }, team2Member_Actor),
      /Active team membership required|FORBIDDEN/
    );

    // Team 2 member tries to create subcategory under Team 1 category
    await assert.rejects(
      () => createSubcategory({ categoryId: team1Cat._id, name: 'Cross Team Sub' }, team2Member_Actor),
      /Cannot use category from another team|FORBIDDEN/
    );

    // Team 2 categories list must not contain Team 1 categories
    const team2Cats = await getCategories(team2Member_Actor);
    const hasTeam1Cat = team2Cats.some((c) => c.name === 'Team Architecture');
    assert.equal(hasTeam1Cat, false, 'Team 2 must not see Team 1 categories');
  });

  await t.test('10. Admin has global power to edit/delete any user or team category', async () => {
    const memberCat = categoriesDB.find((c) => c.name === 'Team Architecture');
    const updatedByAdmin = await updateCategory(
      memberCat._id,
      { name: 'Team Architecture (Admin Reviewed)', description: 'Updated by Admin' },
      adminActor
    );
    assert.equal(updatedByAdmin.name, 'Team Architecture (Admin Reviewed)');
    assert.equal(updatedByAdmin.canEdit, true);
    assert.equal(updatedByAdmin.canDelete, true);
  });

  await t.test('11. Safe deletion prevents deleting categories/subcategories in use by blogs', async () => {
    const userCatA = categoriesDB.find((c) => c.name === 'My AI Notes');
    // Add blog using this category
    blogsDB.push({ _id: 'b1', title: 'Blog on AI', category: userCatA._id });

    await assert.rejects(
      () => deleteCategory(userCatA._id, userA_Actor),
      /Cannot delete category because it is currently used by one or more blogs|CATEGORY_IN_USE/
    );

    // Remove blog from DB
    blogsDB.length = 0;

    // Now deletion succeeds and cascades subcategories
    const deletedCat = await deleteCategory(userCatA._id, userA_Actor);
    assert.equal(deletedCat.name, 'My AI Notes');

    // Subcategories under userCatA must have been cascaded
    const orphanSub = subcategoriesDB.find((s) => String(s.category) === String(userCatA._id));
    assert.equal(orphanSub, undefined, 'Subcategories must be cascade deleted');
  });

  // Restore originals
  Category.find = origCategoryFind;
  Category.findById = origCategoryFindById;
  Category.findOne = origCategoryFindOne;
  Category.create = origCategoryCreate;
  Category.findByIdAndUpdate = origCategoryFindByIdAndUpdate;
  Category.findByIdAndDelete = origCategoryFindByIdAndDelete;

  Subcategory.find = origSubcategoryFind;
  Subcategory.findById = origSubcategoryFindById;
  Subcategory.findOne = origSubcategoryFindOne;
  Subcategory.create = origSubcategoryCreate;
  Subcategory.findByIdAndUpdate = origSubcategoryFindByIdAndUpdate;
  Subcategory.findByIdAndDelete = origSubcategoryFindByIdAndDelete;
  Subcategory.deleteMany = origSubcategoryDeleteMany;

  Keyword.deleteMany = origKeywordDeleteMany;
  Keyword.find = origKeywordFind;
  Blog.exists = origBlogExists;
});
