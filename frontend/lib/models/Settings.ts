import mongoose, { Schema, Model, Document } from 'mongoose';

interface ISettings extends Document {
  key: string;
  value: any;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);

export default Settings;


