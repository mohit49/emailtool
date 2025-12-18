import mongoose, { Schema, Model, Document } from 'mongoose';
import crypto from 'crypto';

export interface IApiKey extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  key: string;
  name?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastUsedAt: {
    type: Date,
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

// Indexes for faster queries
apiKeySchema.index({ projectId: 1, isActive: 1 });
apiKeySchema.index({ key: 1, isActive: 1 });

apiKeySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate a secure API key
apiKeySchema.statics.generateKey = function(): string {
  return 'przio_' + crypto.randomBytes(32).toString('hex');
};

const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', apiKeySchema);

export default ApiKey;

