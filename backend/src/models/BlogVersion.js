import mongoose from 'mongoose';

const blogVersionSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    changeSummary: {
      type: String,
      trim: true,
      default: 'Version snapshot'
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

blogVersionSchema.index({ blogId: 1, versionNumber: -1 });

const BlogVersion = mongoose.model('BlogVersion', blogVersionSchema);

export default BlogVersion;
