import User from '../models/User.js';

export const findUserByEmailOrUsername = async ({ email, username }) =>
  User.findOne({
    $or: [{ email }, { username }]
  });

export const findUserByEmailWithPassword = async (email) =>
  User.findOne({ email: email.toLowerCase().trim() }).select('+password');

export const findUserByEmail = async (email) =>
  User.findOne({ email: email.toLowerCase().trim() });

export const findUserByGoogleId = async (googleId) =>
  User.findOne({ googleId });

export const findUserByUsername = async (username) =>
  User.findOne({ username: username.toLowerCase().trim() });

export const linkGoogleAccount = async (userId, googleId) =>
  User.findOneAndUpdate(
    { _id: userId, $or: [{ googleId: { $exists: false } }, { googleId: null }] },
    { $set: { googleId } },
    { new: true, runValidators: true }
  );

export const findUserById = async (userId) => User.findById(userId);

export const createUser = async (userData) => User.create(userData);

export const updateUserPasswordById = async (userId, hashedPassword) =>
  User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword
    },
    { new: true }
  );

export const updateUserOnboardingById = async (userId, onboardingData) =>
  User.findByIdAndUpdate(userId, onboardingData, { new: true });

export const toSafeUser = (user, options = {}) => ({
  id: user._id || user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  profileImage: user.profileImage,
  bio: user.bio,
  interests: user.interests,
  accountType: user.accountType,
  team: user.team,
  workflowRole: user.workflowRole,
  isOwner: options.isOwner !== undefined ? options.isOwner : Boolean(user.isOwner),
  onboardingCompleted: user.onboardingCompleted,
  authProvider: user.authProvider,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
