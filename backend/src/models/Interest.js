import mongoose from 'mongoose';

const interestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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



const Interest = mongoose.model('Interest', interestSchema);

export default Interest;
