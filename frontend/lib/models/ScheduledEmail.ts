import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IScheduledEmail extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  smtpId: string;
  subject: string;
  html: string;
  recipientFolders: string[]; // Array of folder names
  scheduledAt: Date; // When to send the email
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledEmailSchema = new Schema<IScheduledEmail>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    smtpId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    recipientFolders: {
      type: [String],
      required: true,
      default: [],
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    sentAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of pending scheduled emails
scheduledEmailSchema.index({ status: 1, scheduledAt: 1 });
scheduledEmailSchema.index({ projectId: 1, status: 1 });

const ScheduledEmail: Model<IScheduledEmail> =
  mongoose.models.ScheduledEmail ||
  mongoose.model<IScheduledEmail>('ScheduledEmail', scheduledEmailSchema);

export default ScheduledEmail;

