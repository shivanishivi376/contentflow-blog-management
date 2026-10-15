import Joi from 'joi';

// Schema for the POST /api/invitations/:token/accept route.
// The token itself is in the URL param (validated by the route handler).
// No request body fields are required for acceptance — the server resolves
// team and role exclusively from the stored invitation record.
export const acceptInvitationSchema = Joi.object({}).unknown(false);
