import mongoose, { Schema, Model, Document } from 'mongoose';

interface IRecipient extends Document {
  userId: mongoose.Types.ObjectId; // The user who added this recipient
  name: string;
  email: string;
  folder?: string; // Folder name for organization
  customFields?: Record<string, any>; // Flexible custom fields
  createdAt: Date;
  updatedAt: Date;
}

const recipientSchema = new Schema<IRecipient>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  folder: {
    type: String,
    default: '',
  },
  customFields: {
    type: Schema.Types.Mixed,
    default: {},
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

// Compound index to ensure unique email per user
recipientSchema.index({ userId: 1, email: 1 }, { unique: true });

// Update updatedAt before saving
recipientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Recipient: Model<IRecipient> = mongoose.models.Recipient || mongoose.model<IRecipient>('Recipient', recipientSchema);

export default Recipient;

