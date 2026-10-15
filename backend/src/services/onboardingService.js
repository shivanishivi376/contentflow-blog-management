import AppError from '../utils/AppError.js';
import Interest from '../models/Interest.js';
import { createTeamRecord, findTeamByMemberId } from '../repositories/teamRepository.js';
import { findUserById, toSafeUser, updateUserOnboardingById } from '../repositories/userRepository.js';

const ensureAllInterestsExist = async (interestIds) => {
  const uniqueInterestIds = [...new Set(interestIds.map(String))];
  const foundCount = await Interest.countDocuments({ _id: { $in: uniqueInterestIds } });

  if (foundCount !== uniqueInterestIds.length) {
    throw new AppError('One or more interests are invalid', 400, 'INVALID_INTERESTS');
  }
};

export const completeOnboarding = async (userId, payload) => {
  const user = await findUserById(userId);

  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 404, 'USER_NOT_FOUND');
  }

  if (user.onboardingCompleted) {
    throw new AppError('Onboarding already completed', 409, 'ONBOARDING_ALREADY_COMPLETED');
  }

  await ensureAllInterestsExist(payload.interests);

  let team = null;

  if (payload.accountType === 'TEAM') {
    const existingTeam = await findTeamByMemberId(userId);

    if (existingTeam || user.team) {
      throw new AppError('User already belongs to a team', 409, 'USER_ALREADY_IN_TEAM');
    }

    team = await createTeamRecord({
      name: payload.teamName.trim(),
      owner: user._id,
      workflowRole: payload.workflowRole
    });
  }

  const updatedUser = await updateUserOnboardingById(userId, {
    accountType: payload.accountType,
    interests: payload.interests,
    team: team?._id || null,
    workflowRole: payload.accountType === 'TEAM' ? payload.workflowRole : null,
    onboardingCompleted: true
  });

  return {
    user: toSafeUser(updatedUser, { isOwner: Boolean(team) }),
    team
  };
};

