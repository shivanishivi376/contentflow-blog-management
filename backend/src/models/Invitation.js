import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    // Optional: null means a copy-link invitation (any email may accept).
    // Non-null means an email-specific invitation that enforces email matching.
    email: {
      type: String,
      required: false,
      default: null,
      trim: true,
      lowercase: true
    },
    assignedRole: {
      type: String,
      enum: ['Writer', 'Reviewer', 'Publisher'],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Expired', 'Revoked'],
      default: 'Pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Explicit acceptance timestamp (distinct from updatedAt).
    acceptedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

invitationSchema.index({ team: 1, status: 1 });
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 });

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;

