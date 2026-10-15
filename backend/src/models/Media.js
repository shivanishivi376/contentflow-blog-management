import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    publicId: {
      type: String,
      required: true,
      trim: true
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number
    },
    originalName: {
      type: String,
      trim: true
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

mediaSchema.index({ owner: 1 });
mediaSchema.index({ publicId: 1 });

const Media = mongoose.model('Media', mediaSchema);

export default Media;
