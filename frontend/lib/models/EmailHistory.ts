import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IEmailHistory extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  templateName?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  fromEmail: string;
  fromName?: string;
  smtpId: string;
  status: 'pending' | 'sent' | 'failed' | 'success';
  errorMessage?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailHistorySchema = new Schema<IEmailHistory>({
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
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    index: true,
  },
  templateName: {
    type: String,
    trim: true,
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  recipientName: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  fromEmail: {
    type: String,
    required: true,
    trim: true,
  },
  fromName: {
    type: String,
    trim: true,
  },
  smtpId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'success'],
    default: 'pending',
    required: true,
    index: true,
  },
  errorMessage: {
    type: String,
    trim: true,
  },
  sentAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
emailHistorySchema.index({ projectId: 1, createdAt: -1 });
emailHistorySchema.index({ projectId: 1, status: 1 });
emailHistorySchema.index({ userId: 1, createdAt: -1 });

emailHistorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const EmailHistory: Model<IEmailHistory> = mongoose.models.EmailHistory || mongoose.model<IEmailHistory>('EmailHistory', emailHistorySchema);

export default EmailHistory;











