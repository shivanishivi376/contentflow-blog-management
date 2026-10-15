import mongoose from 'mongoose';

import { ALLOWED_STATUSES, BLOG_STATUS } from '../constants/blogStatus.js';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: true
    },

    primaryKeywords: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Keyword'
        }
      ],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one primary keyword is required'
      }
    },

    secondaryKeywords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Keyword'
      }
    ],

    metaTitle: {
      type: String,
      trim: true,
      default: ''
    },

    metaDescription: {
      type: String,
      trim: true,
      default: ''
    },

    featuredImage: {
      type: String,
      default: ''
    },

    content: {
      type: String,
      default: ''
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    accountType: {
      type: String,
      enum: ['INDIVIDUAL', 'TEAM'],
      required: true,
      default: 'INDIVIDUAL'
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },

    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    status: {
      type: String,
      enum: ALLOWED_STATUSES,
      default: BLOG_STATUS.DRAFT
    },

    publishFailReason: {
      type: String,
      default: null
    },

    publishFailedAt: {
      type: Date,
      default: null
    },

    publishedAt: {
      type: Date
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    devToArticleId: {
      type: Number,
      default: null
    },

    devToUrl: {
      type: String,
      default: null
    },

    devToPublished: {
      type: Boolean,
      default: false
    },

    devToPublishedAt: {
      type: Date,
      default: null
    },

    devToPublishError: {
      type: String,
      default: null
    },

    devToPublishInProgress: {
      type: Boolean,
      default: false,
      select: false
    },

    devToPublishStartedAt: {
      type: Date,
      default: null,
      select: false
    },

    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Additional indexes for frequently queried fields
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ subcategory: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ team: 1 });
blogSchema.index({ publishedAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;