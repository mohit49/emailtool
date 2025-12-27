import mongoose, { Schema, Model, Document } from 'mongoose';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'tel' | 'url';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface IForm extends Document {
  formId: string; // Unique form identifier
  name: string;
  formType: 'subscription' | 'survey' | 'contact' | 'custom' | 'quiz';
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fields: FormField[];
  status: 'draft' | 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const formFieldSchema = new Schema<FormField>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio', 'date', 'tel', 'url'],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    trim: true,
  },
  options: {
    type: [String],
    default: [],
  },
  validation: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

const formSchema = new Schema<IForm>({
  formId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  formType: {
    type: String,
    enum: ['subscription', 'survey', 'contact', 'custom', 'quiz'],
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fields: {
    type: [formFieldSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft',
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

formSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for faster queries
formSchema.index({ projectId: 1 });
formSchema.index({ userId: 1 });
formSchema.index({ formId: 1 });
formSchema.index({ status: 1 });

const Form: Model<IForm> = mongoose.models.Form || mongoose.model<IForm>('Form', formSchema);

export default Form;

