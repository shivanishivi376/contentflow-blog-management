import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    workflowRole: {
      type: String,
      enum: ['Writer', 'Reviewer', 'Publisher'],
      required: true
    },

    isOwner: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'REMOVED'],
      default: 'ACTIVE'
    }
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
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
      trim: true,
      lowercase: true,
      default: ''
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    members: [teamMemberSchema],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

teamSchema.pre('save', function () {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});


teamSchema.index({ name: 1 });
teamSchema.index({ 'members.user': 1 });

const Team = mongoose.model('Team', teamSchema);

export default Team;