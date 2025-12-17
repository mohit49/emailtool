import mongoose, { Schema, Model, Document } from 'mongoose';

interface ISharedTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  html: string;
  shareToken: string; // Unique token for the shareable link
  expiresAt?: Date; // Optional expiration date
  createdAt: Date;
  updatedAt: Date;
}

const sharedTemplateSchema = new Schema<ISharedTemplate>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
  },
  html: {
    type: String,
    required: true,
  },
  shareToken: {
    type: String,
    unique: true,
  },
  expiresAt: {
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

// Generate unique share token before saving
sharedTemplateSchema.pre('save', function(next) {
  if (!this.shareToken) {
    // Generate a unique token using Node.js crypto
    const crypto = require('crypto');
    this.shareToken = crypto.randomBytes(16).toString('hex');
  }
  this.updatedAt = new Date();
  next();
});

// Index for faster lookups
sharedTemplateSchema.index({ shareToken: 1 });
sharedTemplateSchema.index({ userId: 1 });
sharedTemplateSchema.index({ userId: 1, templateId: 1 }); // For finding existing shares by template

const SharedTemplate: Model<ISharedTemplate> = mongoose.models.SharedTemplate || mongoose.model<ISharedTemplate>('SharedTemplate', sharedTemplateSchema);

export default SharedTemplate;

