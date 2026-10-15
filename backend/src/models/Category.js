import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255,
      default: ''
    },
    scope: {
      type: String,
      enum: ['GLOBAL', 'INDIVIDUAL', 'TEAM'],
      default: 'GLOBAL',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
      default: null,
      index: true
    },
    createdByModel: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'Admin'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true
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

categorySchema.index({ name: 1 });
categorySchema.index({ scope: 1, team: 1, createdBy: 1 });
categorySchema.index({ scope: 1, slug: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
