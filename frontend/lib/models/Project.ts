import mongoose, { Schema, Model, Document } from 'mongoose';

interface IProject extends Document {
  name: string;
  description?: string;
  defaultTemplateId?: mongoose.Types.ObjectId;
  defaultSmtpId?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  defaultTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
  },
  defaultSmtpId: {
    type: String,
    trim: true,
  },
  createdBy: {
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

projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
projectSchema.index({ createdBy: 1 });
projectSchema.index({ name: 1 });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

export default Project;

