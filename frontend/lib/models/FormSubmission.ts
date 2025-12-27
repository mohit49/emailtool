import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IFormSubmission extends Document {
  formId: string; // Reference to Form.formId
  formObjectId: mongoose.Types.ObjectId; // Reference to Form._id
  projectId: mongoose.Types.ObjectId;
  data: Record<string, any>; // Flexible data structure for form field values
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const formSubmissionSchema = new Schema<IFormSubmission>({
  formId: {
    type: String,
    required: true,
    index: true,
  },
  formObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
    index: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
});

// Indexes for faster queries
formSubmissionSchema.index({ formId: 1, submittedAt: -1 });
formSubmissionSchema.index({ projectId: 1, submittedAt: -1 });

const FormSubmission: Model<IFormSubmission> = mongoose.models.FormSubmission || mongoose.model<IFormSubmission>('FormSubmission', formSubmissionSchema);

export default FormSubmission;

