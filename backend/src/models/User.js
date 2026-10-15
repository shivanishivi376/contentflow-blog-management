import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      unique: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },

    password: {
      type: String,
      required: function isPasswordRequired() {
        return this.authProvider === 'LOCAL';
      },
      minlength: 8,
      select: false
    },

    googleId: {
      type: String,
      default: undefined
    },

    profileImage: {
      url: {
        type: String,
        default: ''
      },
      publicId: {
        type: String,
        default: ''
      }
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interest'
      }
    ],

    accountType: {
      type: String,
      enum: ['INDIVIDUAL', 'TEAM'],
      default: 'INDIVIDUAL'
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },

    workflowRole: {
      type: String,
      enum: ['Writer', 'Reviewer', 'Publisher', null],
      default: null
    },

    onboardingCompleted: {
      type: Boolean,
      default: false
    },

    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      default: 'LOCAL'
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

export default User;