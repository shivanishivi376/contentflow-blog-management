import mongoose from 'mongoose';

const externalPublicationSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    externalPlatform: {
      type: String,
      enum: ['DEVTO'],
      default: 'DEVTO'
    },
    externalArticleId: {
      type: String,
      required: true
    },
    externalUrl: {
      type: String,
      required: true
    },
    publicationStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS'
    },
    responseMetadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

externalPublicationSchema.index({ blog: 1, externalPlatform: 1 });

const ExternalPublication = mongoose.model('ExternalPublication', externalPublicationSchema);

export default ExternalPublication;
