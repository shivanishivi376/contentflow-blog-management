import Invitation from '../models/Invitation.js';

export const createInvitationRecord = async (payload) => Invitation.create(payload);

export const findPendingInvitationByTeamEmailRole = async ({ teamId, email, assignedRole }) =>
  Invitation.findOne({
    team: teamId,
    email,
    assignedRole,
    status: 'Pending',
    expiresAt: { $gt: new Date() }
  });

export const findPendingInvitationsByTeamId = async (teamId) =>
  Invitation.find({
    team: teamId,
    status: 'Pending',
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

export const findInvitationByToken = async (token) =>
  Invitation.findOne({ token })
    .populate('team', 'name owner members isActive')
    .populate('createdBy', 'name username email')
    .populate('acceptedBy', 'name username email');

export const findInvitationById = async (id) => Invitation.findById(id);

export const acceptInvitationRecord = async ({ invitationId, acceptedBy }) =>
  Invitation.findByIdAndUpdate(
    invitationId,
    {
      status: 'Accepted',
      acceptedBy
    },
    { new: true }
  );

export const revokeInvitationRecord = async (invitationId) =>
  Invitation.findByIdAndUpdate(
    invitationId,
    {
      status: 'Revoked'
    },
    { new: true }
  );

