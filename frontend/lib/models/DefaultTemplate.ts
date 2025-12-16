import mongoose, { Schema, Model, Document } from 'mongoose';

interface IDefaultTemplate extends Document {
  name: string;
  description?: string;
  html: string;
  category?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const defaultTemplateSchema = new Schema<IDefaultTemplate>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  html: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General',
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

defaultTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const DefaultTemplate: Model<IDefaultTemplate> = mongoose.models.DefaultTemplate || mongoose.model<IDefaultTemplate>('DefaultTemplate', defaultTemplateSchema);

export default DefaultTemplate;


