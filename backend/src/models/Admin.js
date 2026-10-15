import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
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
      required: true,
      minlength: 8,
      select: false
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

    isMainAdmin: {
      type: Boolean,
      default: true
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

// Only one admin can have isMainAdmin = true
adminSchema.index(
  { isMainAdmin: 1 },
  {
    unique: true,
    partialFilterExpression: { isMainAdmin: true }
  }
);

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;