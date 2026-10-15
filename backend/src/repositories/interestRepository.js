import Interest from '../models/Interest.js';

export const findInterests = async () => Interest.find({}).sort({ name: 1 });

export const findInterestById = async (interestId) => Interest.findById(interestId);

export const findInterestBySlug = async (slug) =>
  Interest.findOne({ slug: slug.toLowerCase().trim() });

export const createInterestRecord = async (payload) => Interest.create(payload);

export const updateInterestRecord = async (interestId, payload) =>
  Interest.findByIdAndUpdate(interestId, payload, { new: true, runValidators: true });

export const deleteInterestRecord = async (interestId) => Interest.findByIdAndDelete(interestId);
