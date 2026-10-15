import AppError from '../utils/AppError.js';
import { findTeamDashboardByMemberId } from '../repositories/teamRepository.js';
import { findPendingInvitationsByTeamId } from '../repositories/invitationRepository.js';
import { formatInvitation, buildInvitationLink } from './invitationService.js';


const asStringId = (value) => String(value?._id || value || '');

const formatUserSummary = (user) => ({
  id: asStringId(user),
  name: user?.name || '',
  username: user?.username || '',
  email: user?.email || '',
  profileImage: user?.profileImage || { url: '', publicId: '' }
});

const formatMember = (member, currentUserId) => {
  const userId = asStringId(member.user);

  return {
    user: formatUserSummary(member.user),
    workflowRole: member.workflowRole,
    isOwner: Boolean(member.isOwner),
    status: member.status,
    isCurrentUser: userId === String(currentUserId)
  };
};

export const formatTeamDashboard = (team, currentUserId, pendingInvitations = []) => {
  const activeMembers = (team.members || [])
    .filter((member) => member.status === 'ACTIVE')
    .map((member) => formatMember(member, currentUserId));

  const currentUser = activeMembers.find((member) => member.isCurrentUser) || null;
  const currentUserIsOwner = Boolean(currentUser?.isOwner);

  return {
    id: asStringId(team),
    name: team.name,
    owner: formatUserSummary(team.owner),
    members: activeMembers,
    pendingInvitations: pendingInvitations.map((invitation) =>
      formatInvitation(invitation, {
        invitationLink: invitation.token
          ? buildInvitationLink(process.env.CLIENT_URL, invitation.token)
          : undefined
      })
    ),
    settings: {
      isActive: Boolean(team.isActive),
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    },
    currentUser: {
      isOwner: currentUserIsOwner,
      workflowRole: currentUser?.workflowRole || null
    },
    permissions: {
      canViewMembers: true,
      canInviteMembers: currentUserIsOwner,
      canRevokeInvitations: currentUserIsOwner,
      canRemoveMembers: currentUserIsOwner,
      canChangeWorkflowRoles: currentUserIsOwner,
      canManageSettings: currentUserIsOwner
    }
  };
};

import Team from '../models/Team.js';
import User from '../models/User.js';

export const getMyTeamDashboard = async (userId) => {
  const team = await findTeamDashboardByMemberId(userId);

  if (!team) {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  const pendingInvitations = await findPendingInvitationsByTeamId(team._id);

  return formatTeamDashboard(team, userId, pendingInvitations);
};

export const removeTeamMember = async ({ teamId, ownerId, memberUserId }) => {
  const team = await Team.findById(teamId);
  if (!team || !team.isActive) {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  const ownerMember = (team.members || []).find(
    (m) => String(m.user) === String(ownerId) && m.status === 'ACTIVE'
  );
  if (!ownerMember?.isOwner) {
    throw new AppError('Only the team owner can remove team members', 403, 'TEAM_OWNER_REQUIRED');
  }

  const targetMember = (team.members || []).find(
    (m) => String(m.user) === String(memberUserId) && m.status === 'ACTIVE'
  );
  if (!targetMember) {
    throw new AppError('Member not found in team', 404, 'MEMBER_NOT_FOUND');
  }

  if (targetMember.isOwner) {
    throw new AppError('Cannot remove the team owner', 400, 'CANNOT_REMOVE_OWNER');
  }

  targetMember.status = 'REMOVED';
  await team.save();

  await User.findByIdAndUpdate(memberUserId, {
    accountType: 'INDIVIDUAL',
    team: null,
    workflowRole: null
  });

  return { message: 'Member removed successfully' };
};

