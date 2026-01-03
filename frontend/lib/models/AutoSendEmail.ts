import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IAutoSendEmail extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId; // Which form triggers this
  templateId: mongoose.Types.ObjectId;
  smtpId: string;
  subject: string;
  html: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const autoSendEmailSchema = new Schema<IAutoSendEmail>(
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
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
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
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
autoSendEmailSchema.index({ formId: 1, enabled: 1 });
autoSendEmailSchema.index({ projectId: 1, enabled: 1 });

const AutoSendEmail: Model<IAutoSendEmail> =
  mongoose.models.AutoSendEmail ||
  mongoose.model<IAutoSendEmail>('AutoSendEmail', autoSendEmailSchema);

export default AutoSendEmail;

