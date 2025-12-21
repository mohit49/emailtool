import mongoose, { Schema, Model, Document } from 'mongoose';

interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId; // Optional for backward compatibility
  name: string;
  html: string;
  folder?: string;
  isDefault?: boolean;
  defaultTemplateId?: mongoose.Types.ObjectId;
  customTemplateId?: string; // User-defined custom template ID (unique within project)
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  name: {
    type: String,
    required: true,
  },
  html: {
    type: String,
    required: true,
  },
  folder: {
    type: String,
    default: '',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  defaultTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DefaultTemplate',
  },
  customTemplateId: {
    type: String,
    default: '',
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

templateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>('Template', templateSchema);

export default Template;

