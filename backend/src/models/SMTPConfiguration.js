import mongoose from 'mongoose';

const smtpConfigurationSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      required: true,
      trim: true
    },
    port: {
      type: Number,
      required: true,
      default: 587
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    senderName: {
      type: String,
      required: true,
      trim: true
    },
    isEmailNotificationEnabled: {
      type: Boolean,
      default: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

const SMTPConfiguration = mongoose.model('SMTPConfiguration', smtpConfigurationSchema);

export default SMTPConfiguration;
