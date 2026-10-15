import Team from '../models/Team.js';

export const createTeamRecord = async ({ name, owner, workflowRole }) =>
  Team.create({
    name,
    owner,
    members: [
      {
        user: owner,
        workflowRole,
        isOwner: true,
        status: 'ACTIVE'
      }
    ]
  });

export const findTeamByMemberId = async (userId) =>
  Team.findOne({
    'members.user': userId,
    'members.status': 'ACTIVE'
  });

export const findTeamDashboardByMemberId = async (userId) =>
  Team.findOne({
    'members.user': userId,
    'members.status': 'ACTIVE'
  })
    .populate('owner', 'name username email profileImage')
    .populate('members.user', 'name username email profileImage');
