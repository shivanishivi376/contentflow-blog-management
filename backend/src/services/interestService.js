import AppError from '../utils/AppError.js';
import {
  createInterestRecord,
  deleteInterestRecord,
  findInterestById,
  findInterestBySlug,
  findInterests,
  updateInterestRecord
} from '../repositories/interestRepository.js';

const normalizeInterestPayload = (payload) => ({
  name: payload.name.trim(),
  slug: payload.slug.trim().toLowerCase(),
  description: payload.description?.trim() || ''
});

export const getInterests = async () => findInterests();

export const getInterestById = async (interestId) => {
  const interest = await findInterestById(interestId);

  if (!interest) {
    throw new AppError('Interest not found', 404, 'INTEREST_NOT_FOUND');
  }

  return interest;
};

export const createInterest = async (payload) => {
  const normalizedPayload = normalizeInterestPayload(payload);
  const existingInterest = await findInterestBySlug(normalizedPayload.slug);

  if (existingInterest) {
    throw new AppError('Interest slug already exists', 409, 'INTEREST_SLUG_EXISTS');
  }

  const existingByName = await InterestExistsByName(normalizedPayload.name);

  if (existingByName) {
    throw new AppError('Interest name already exists', 409, 'INTEREST_NAME_EXISTS');
  }

  return createInterestRecord(normalizedPayload);
};

const InterestExistsByName = async (name) => {
  const normalizedName = name.trim();
  const all = await findInterests();
  return all.some((interest) => interest.name === normalizedName);
};

export const updateInterest = async (interestId, payload) => {
  const interest = await findInterestById(interestId);

  if (!interest) {
    throw new AppError('Interest not found', 404, 'INTEREST_NOT_FOUND');
  }

  const normalizedPayload = normalizeInterestPayload(payload);

  if (normalizedPayload.slug !== interest.slug) {
    const existingInterest = await findInterestBySlug(normalizedPayload.slug);

    if (existingInterest && String(existingInterest._id) !== String(interest._id)) {
      throw new AppError('Interest slug already exists', 409, 'INTEREST_SLUG_EXISTS');
    }
  }

  if (normalizedPayload.name !== interest.name) {
    const existingByName = await InterestExistsByName(normalizedPayload.name);

    if (existingByName) {
      throw new AppError('Interest name already exists', 409, 'INTEREST_NAME_EXISTS');
    }
  }

  return updateInterestRecord(interestId, normalizedPayload);
};

export const deleteInterest = async (interestId) => {
  const interest = await deleteInterestRecord(interestId);

  if (!interest) {
    throw new AppError('Interest not found', 404, 'INTEREST_NOT_FOUND');
  }

  return interest;
};
