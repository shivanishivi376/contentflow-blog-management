import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255,
      default: ''
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



const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
