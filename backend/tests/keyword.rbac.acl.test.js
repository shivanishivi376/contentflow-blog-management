import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import AppError from '../src/utils/AppError.js';
import Keyword from '../src/models/Keyword.js';
import Category from '../src/models/Category.js';
import Subcategory from '../src/models/Subcategory.js';
import Blog from '../src/models/Blog.js';
import {
  createKeyword,
  getKeywordById,
  getKeywords,
  updateKeyword,
  deleteKeyword
} from '../src/services/keywordService.js';
import { listBlogs } from '../src/services/blogService.js';

test('Keyword CRUD & ACL Flow Validation', async (t) => {
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
  const teamMember_Id = new mongoose.Types.ObjectId().toString();
  const teamMember_Actor = {
    type: 'USER',
    id: teamMember_Id,
    accountType: 'TEAM',
    teamMembership: {
      teamId: team1_Id,
      workflowRole: 'Writer',
      isOwner: false
    }
  };

  const cat1_Id = new mongoose.Types.ObjectId();
  const sub1_Id = new mongoose.Types.ObjectId();

  const mockCategory = {
    _id: cat1_Id,
    name: 'Technology',
    slug: 'technology',
    isActive: true,
    scope: 'GLOBAL'
  };

  const mockSubcategory = {
    _id: sub1_Id,
    name: 'Web Development',
    slug: 'web-development',
    category: cat1_Id,
    isActive: true,
    scope: 'GLOBAL'
  };

  let keywordsDB = [];

  const createMockQuery = (result) => {
    const query = {
      populate: () => query,
      sort: () => query,
      skip: () => query,
      limit: () => query,
      lean: () => Promise.resolve(result),
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
      catch: (reject) => Promise.resolve(result).catch(reject)
    };
    return query;
  };

  const origCatFindById = Category.findById;
  const origSubFindById = Subcategory.findById;
  const origKwFind = Keyword.find;
  const origKwFindById = Keyword.findById;
  const origKwFindOne = Keyword.findOne;
  const origKwCreate = Keyword.create;
  const origKwFindByIdAndUpdate = Keyword.findByIdAndUpdate;
  const origKwFindByIdAndDelete = Keyword.findByIdAndDelete;
  const origBlogCountDocuments = Blog.countDocuments;
  const origBlogFind = Blog.find;

  Category.findById = () => createMockQuery(mockCategory);
  Subcategory.findById = () => createMockQuery(mockSubcategory);

  Keyword.create = async (doc) => {
    const created = {
      _id: new mongoose.Types.ObjectId(),
      ...doc,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function() { return { ...this }; }
    };
    keywordsDB.push(created);
    return created;
  };

  Keyword.findById = (id) => {
    const found = keywordsDB.find((k) => String(k._id) === String(id));
    return createMockQuery(found || null);
  };

  Keyword.findOne = (filter = {}) => {
    const found = keywordsDB.find((k) => {
      if (filter.subcategory && String(k.subcategory) !== String(filter.subcategory)) return false;
      if (filter.slug && k.slug !== filter.slug) return false;
      if (filter.keywordType && k.keywordType !== filter.keywordType) return false;
      if (filter.name) {
        if (filter.name instanceof RegExp) {
          if (!filter.name.test(k.name)) return false;
        } else if (k.name.toLowerCase() !== filter.name.toLowerCase()) {
          return false;
        }
      }
      if (filter.scope && k.scope !== filter.scope) return false;
      if (filter.createdBy && String(k.createdBy) !== String(filter.createdBy)) return false;
      if (filter.team && String(k.team) !== String(filter.team)) return false;
      if (filter.$or) {
        const matchesOr = filter.$or.some((orCond) => {
          if (orCond.scope === 'GLOBAL' && k.scope === 'GLOBAL') return true;
          if (orCond.scope?.$exists === false && !k.scope) return true;
          if (orCond.scope === 'INDIVIDUAL' && k.scope === 'INDIVIDUAL' && String(k.createdBy) === String(orCond.createdBy)) return true;
          if (orCond.scope === 'TEAM' && k.scope === 'TEAM' && String(k.team) === String(orCond.team)) return true;
          return false;
        });
        if (!matchesOr) return false;
      }
      return true;
    });
    return createMockQuery(found || null);
  };

  Keyword.find = (filter = {}) => {
    return createMockQuery(keywordsDB);
  };

  Keyword.findByIdAndUpdate = (id, update) => {
    const item = keywordsDB.find((k) => String(k._id) === String(id));
    if (item) {
      Object.assign(item, update);
    }
    return createMockQuery(item || null);
  };

  Keyword.findByIdAndDelete = (id) => {
    const idx = keywordsDB.findIndex((k) => String(k._id) === String(id));
    const removed = idx !== -1 ? keywordsDB.splice(idx, 1)[0] : null;
    return createMockQuery(removed);
  };

  t.after(() => {
    Category.findById = origCatFindById;
    Subcategory.findById = origSubFindById;
    Keyword.find = origKwFind;
    Keyword.findById = origKwFindById;
    Keyword.findOne = origKwFindOne;
    Keyword.create = origKwCreate;
    Keyword.findByIdAndUpdate = origKwFindByIdAndUpdate;
    Keyword.findByIdAndDelete = origKwFindByIdAndDelete;
    Blog.countDocuments = origBlogCountDocuments;
    Blog.find = origBlogFind;
  });

  await t.test('1. Admin can create GLOBAL keyword', async () => {
    const result = await createKeyword(
      {
        name: 'React 19',
        categoryId: cat1_Id.toString(),
        subcategoryId: sub1_Id.toString(),
        keywordType: 'primary'
      },
      adminActor
    );

    assert.equal(result.name, 'React 19');
    assert.equal(result.scope, 'GLOBAL');
    assert.equal(result.canEdit, true);
    assert.equal(result.canDelete, true);
  });

  await t.test('2. User A can create INDIVIDUAL keyword', async () => {
    const result = await createKeyword(
      {
        name: 'User A Secret Tech',
        categoryId: cat1_Id.toString(),
        subcategoryId: sub1_Id.toString(),
        keywordType: 'secondary'
      },
      userA_Actor
    );

    assert.equal(result.name, 'User A Secret Tech');
    assert.equal(result.scope, 'INDIVIDUAL');
    assert.equal(result.isOwner, true);
    assert.equal(result.canEdit, true);
    assert.equal(result.canDelete, true);
  });

  await t.test('3. Team member creates TEAM scoped keyword', async () => {
    const result = await createKeyword(
      {
        name: 'Team Architecture Docs',
        categoryId: cat1_Id.toString(),
        subcategoryId: sub1_Id.toString(),
        keywordType: 'primary'
      },
      teamMember_Actor
    );

    assert.equal(result.name, 'Team Architecture Docs');
    assert.equal(result.scope, 'TEAM');
    assert.equal(result.team.toString(), team1_Id.toString());
  });

  await t.test('4. User B cannot edit User A INDIVIDUAL keyword', async () => {
    const userAKeyword = keywordsDB.find((k) => k.name === 'User A Secret Tech');
    assert.ok(userAKeyword, 'userAKeyword must exist');

    await assert.rejects(
      async () => {
        await updateKeyword(userAKeyword._id.toString(), { name: 'Hacked Name' }, userB_Actor);
      },
      (err) => err.statusCode === 403
    );
  });

  await t.test('5. Normal user cannot edit or delete GLOBAL keyword', async () => {
    const globalKeyword = keywordsDB.find((k) => k.name === 'React 19');
    assert.ok(globalKeyword, 'globalKeyword must exist');

    await assert.rejects(
      async () => {
        await updateKeyword(globalKeyword._id.toString(), { name: 'Attempt Change' }, userA_Actor);
      },
      (err) => err.statusCode === 403
    );

    await assert.rejects(
      async () => {
        await deleteKeyword(globalKeyword._id.toString(), userA_Actor);
      },
      (err) => err.statusCode === 403
    );
  });

  await t.test('6. Safe deletion protects keyword in use by blogs', async () => {
    const userAKeyword = keywordsDB.find((k) => k.name === 'User A Secret Tech');
    assert.ok(userAKeyword, 'userAKeyword must exist');
    Blog.countDocuments = () => createMockQuery(3); // 3 blogs use this keyword

    await assert.rejects(
      async () => {
        await deleteKeyword(userAKeyword._id.toString(), userA_Actor);
      },
      (err) => err.statusCode === 400 && err.message.includes('referenced by existing blog posts')
    );
  });

  await t.test('7. Blogs tab filter isolates user blogs from general published blogs', async () => {
    let capturedFilter = null;
    Blog.find = (filter) => {
      capturedFilter = filter;
      return createMockQuery([]);
    };
    Blog.countDocuments = () => createMockQuery(0);

    await listBlogs({}, userA_Actor);

    assert.ok(capturedFilter, 'Filter should be applied');
    assert.ok(capturedFilter.$or, 'User query must scope with $or criteria');

    // Ensure { status: 'PUBLISHED' } is NOT in the user filter
    const hasUnscopedPublished = capturedFilter.$or.some(
      (cond) => cond.status === 'PUBLISHED' && Object.keys(cond).length === 1
    );
    assert.equal(
      hasUnscopedPublished,
      false,
      'Should not include general PUBLISHED blogs in private user panel'
    );

    // Ensure author matches user
    const hasAuthorMatch = capturedFilter.$or.some(
      (cond) => cond.author && cond.author.toString() === userA_Id
    );
    assert.equal(hasAuthorMatch, true, 'User author condition must be present');
  });
});
