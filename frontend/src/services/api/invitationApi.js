import apiClient from './apiClient.js'

/**
 * Fetch public invitation details by token (no auth required).
 * Returns: { id, team, email, assignedRole, status, expiresAt, createdAt }
 * Note: the raw token is never returned by the server.
 */
export const getInvitationRequest = (token) =>
  apiClient.get(`/api/invitations/${token}`)

/**
 * Accept an invitation after authentication.
 * The server resolves team and role exclusively from the stored invitation record —
 * no body fields are needed or trusted from the frontend.
 */
export const acceptInvitationRequest = (token) =>
  apiClient.post(`/api/invitations/${token}/accept`)
