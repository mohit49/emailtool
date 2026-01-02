import mongoose, { Schema, Model, Document } from 'mongoose';

interface IProjectInvitation extends Document {
  email: string;
  projectId: mongoose.Types.ObjectId;
  role: 'emailDeveloper' | 'ProjectAdmin';
  addedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectInvitationSchema = new Schema<IProjectInvitation>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  role: {
    type: String,
    enum: ['emailDeveloper', 'ProjectAdmin'],
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure unique pending invitation per email and project
projectInvitationSchema.index({ email: 1, projectId: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'pending' }
});

// Index for faster queries
projectInvitationSchema.index({ email: 1 });
projectInvitationSchema.index({ projectId: 1 });
projectInvitationSchema.index({ status: 1 });

// Update updatedAt before saving
projectInvitationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ProjectInvitation: Model<IProjectInvitation> = 
  mongoose.models.ProjectInvitation || 
  mongoose.model<IProjectInvitation>('ProjectInvitation', projectInvitationSchema);

export default ProjectInvitation;













