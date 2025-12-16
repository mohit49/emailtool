import mongoose, { Schema, Model, Document } from 'mongoose';

interface IUserSmtp extends Document {
  userId: mongoose.Types.ObjectId;
  name?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSmtpSchema = new Schema<IUserSmtp>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    default: 'Default',
  },
  smtpHost: {
    type: String,
    required: true,
  },
  smtpPort: {
    type: Number,
    required: true,
    default: 587,
  },
  smtpUser: {
    type: String,
    required: true,
  },
  smtpPass: {
    type: String,
    required: true,
  },
  smtpFrom: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
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

userSmtpSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const UserSmtp: Model<IUserSmtp> = mongoose.models.UserSmtp || mongoose.model<IUserSmtp>('UserSmtp', userSmtpSchema);

export default UserSmtp;

