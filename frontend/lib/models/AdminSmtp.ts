import mongoose, { Schema, Model, Document } from 'mongoose';

interface IAdminSmtp extends Document {
  title: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  isActive: boolean;
  isDefault: boolean; // Default SMTP for all users
  createdAt: Date;
  updatedAt: Date;
}

const adminSmtpSchema = new Schema<IAdminSmtp>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  smtpHost: {
    type: String,
    required: true,
    trim: true,
  },
  smtpPort: {
    type: Number,
    required: true,
    default: 587,
  },
  smtpUser: {
    type: String,
    required: true,
    trim: true,
  },
  smtpPass: {
    type: String,
    required: true,
  },
  smtpFrom: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
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

// Only one default SMTP can exist
adminSmtpSchema.index({ isDefault: 1 }, { unique: true, sparse: true });

// Update updatedAt before saving
adminSmtpSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const AdminSmtp: Model<IAdminSmtp> = mongoose.models.AdminSmtp || mongoose.model<IAdminSmtp>('AdminSmtp', adminSmtpSchema);

export default AdminSmtp;


