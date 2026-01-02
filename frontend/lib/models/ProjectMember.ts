import mongoose, { Schema, Model, Document } from 'mongoose';

export type ProjectRole = 'emailDeveloper' | 'ProjectAdmin';

interface IProjectMember extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  role: ProjectRole;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only be added once per project
projectMemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });

// Index for faster queries
projectMemberSchema.index({ projectId: 1 });
projectMemberSchema.index({ userId: 1 });

projectMemberSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ProjectMember: Model<IProjectMember> = mongoose.models.ProjectMember || mongoose.model<IProjectMember>('ProjectMember', projectMemberSchema);

export default ProjectMember;












