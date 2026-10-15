import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true,
      index: true
    },
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
    keywordType: {
      type: String,
      enum: ['primary', 'secondary'],
      required: true,
      index: true
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

keywordSchema.index({ subcategory: 1, slug: 1, scope: 1 });
keywordSchema.index({ subcategory: 1, name: 1, keywordType: 1, scope: 1 });
keywordSchema.index({ scope: 1, team: 1, createdBy: 1 });

const Keyword = mongoose.model('Keyword', keywordSchema);

export default Keyword;
