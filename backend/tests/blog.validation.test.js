import test from 'node:test';
import assert from 'node:assert/strict';
import joiValidator from '../src/utils/joiValidator.js';
import { blogCreateSchema, blogUpdateSchema } from '../src/validators/blog.validator.js';
import { validateTaxonomyHierarchy } from '../src/services/blogService.js';
import AppError from '../src/utils/AppError.js';
import Category from '../src/models/Category.js';
import Subcategory from '../src/models/Subcategory.js';
import Keyword from '../src/models/Keyword.js';

test('blog validation: blogCreateSchema requires at least one primary keyword', () => {
  const validBase = {
    title: 'Modern Architecture in 2026',
    slug: 'modern-architecture-2026',
    category: '507f1f77bcf86cd799439011',
    subcategory: '507f191e810c19729de860ea'
  };

  // Missing primaryKeywords
  const { error: missingError } = joiValidator(blogCreateSchema, validBase);
  assert.ok(missingError, 'Must fail when primaryKeywords is missing');
  assert.match(missingError.details.map((d) => d.message).join(' '), /primary keyword/i);

  // Empty primaryKeywords array
  const { error: emptyError } = joiValidator(blogCreateSchema, {
    ...validBase,
    primaryKeywords: []
  });
  assert.ok(emptyError, 'Must fail when primaryKeywords is empty array');
  assert.match(emptyError.details.map((d) => d.message).join(' '), /primary keyword/i);

  // Valid primaryKeywords array
  const { error: validError, value } = joiValidator(blogCreateSchema, {
    ...validBase,
    primaryKeywords: ['507f191e810c19729de860eb']
  });
  assert.equal(validError, undefined, 'Must pass when at least one primary keyword is provided');
  assert.equal(value.primaryKeywords.length, 1);
});

test('blog validation: blogUpdateSchema rejects empty array for primaryKeywords', () => {
  const { error: emptyError } = joiValidator(blogUpdateSchema, {
    primaryKeywords: []
  });
  assert.ok(emptyError, 'Must reject empty array on update');

  const { error: validError } = joiValidator(blogUpdateSchema, {
    primaryKeywords: ['507f191e810c19729de860eb']
  });
  assert.equal(validError, undefined, 'Must accept non-empty array on update');
});

test('blog validation: validateTaxonomyHierarchy enforces primary keywords in service logic', async () => {
  const catId = '507f1f77bcf86cd799439011';
  const subcatId = '507f191e810c19729de860ea';
  const kwPrimaryId = '507f191e810c19729de860eb';
  const kwSecondaryId = '507f191e810c19729de860ec';

  const origCatFindById = Category.findById;
  const origSubcatFindById = Subcategory.findById;
  const origKwFind = Keyword.find;

  Category.findById = async () => ({ _id: catId, isActive: true, scope: 'GLOBAL' });
  Subcategory.findById = async () => ({ _id: subcatId, category: catId, isActive: true, scope: 'GLOBAL' });
  const allKws = [
    { _id: kwPrimaryId, subcategory: subcatId, isActive: true, keywordType: 'primary' },
    { _id: kwSecondaryId, subcategory: subcatId, isActive: true, keywordType: 'secondary' }
  ];
  Keyword.find = async (query = {}) => {
    if (query?._id?.$in) {
      return allKws.filter((k) => query._id.$in.map(String).includes(String(k._id)));
    }
    return allKws;
  };

  try {
    // 1. Rejects empty primary keywords
    await assert.rejects(
      () => validateTaxonomyHierarchy({
        categoryId: catId,
        subcategoryId: subcatId,
        primaryKeywords: []
      }),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.statusCode, 400);
        assert.equal(err.code, 'PRIMARY_KEYWORD_REQUIRED');
        return true;
      }
    );

    // 2. Rejects secondary keyword passed as primary
    await assert.rejects(
      () => validateTaxonomyHierarchy({
        categoryId: catId,
        subcategoryId: subcatId,
        primaryKeywords: [kwSecondaryId]
      }),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.statusCode, 400);
        assert.equal(err.code, 'INVALID_PRIMARY_KEYWORD');
        return true;
      }
    );

    // 3. Passes with valid primary keyword
    await validateTaxonomyHierarchy({
      categoryId: catId,
      subcategoryId: subcatId,
      primaryKeywords: [kwPrimaryId],
      secondaryKeywords: [kwSecondaryId]
    });
  } finally {
    Category.findById = origCatFindById;
    Subcategory.findById = origSubcatFindById;
    Keyword.find = origKwFind;
  }
});
