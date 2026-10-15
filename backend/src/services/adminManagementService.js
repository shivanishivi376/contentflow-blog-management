import User from '../models/User.js';
import Team from '../models/Team.js';
import Invitation from '../models/Invitation.js';
import Blog from '../models/Blog.js';
import AppError from '../utils/AppError.js';
import { toSafeUser } from '../repositories/userRepository.js';
import { revokeRefreshTokensForUser } from '../repositories/refreshTokenRepository.js';

export const listAllUsers = async (query = {}) => {
  const { page = 1, limit = 20, search } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('team', 'name slug')
      .lean(),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};

export const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
  await user.save();

  if (!user.isActive) {
    await revokeRefreshTokensForUser(userId);
  }

  return toSafeUser(user);
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await User.findByIdAndDelete(userId);
  await revokeRefreshTokensForUser(userId);

  return { message: 'User deleted successfully' };
};

export const listAllTeams = async (query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [teams, total] = await Promise.all([
    Team.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name username email')
      .populate('members.user', 'name username email')
      .lean(),
    Team.countDocuments()
  ]);

  const formattedTeams = teams.map((team) => ({
    ...team,
    slug: team.slug || team.name?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || 'team'
  }));

  return {
    teams: formattedTeams,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};

export const deleteTeam = async (teamId) => {
  const team = await Team.findById(teamId);

  if (!team) {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  // Update associated users: revert account type to INDIVIDUAL and clear team associations
  await User.updateMany(
    { team: teamId },
    { $set: { accountType: 'INDIVIDUAL', team: null, workflowRole: null } }
  );

  // Clean up pending invitations for this team
  await Invitation.deleteMany({ team: teamId });

  // Update blogs associated with this team
  await Blog.updateMany(
    { team: teamId },
    { $set: { accountType: 'INDIVIDUAL', team: null } }
  );

  // Delete team record
  await Team.findByIdAndDelete(teamId);

  return { message: 'Team deleted successfully' };
};


