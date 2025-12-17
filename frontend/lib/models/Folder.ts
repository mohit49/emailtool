import mongoose, { Schema, Model, Document } from 'mongoose';

interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'template' | 'recipient'; // Type of folder (for templates or recipients)
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['template', 'recipient'],
    default: 'template',
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

// Ensure unique folder names per user and type
folderSchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

folderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>('Folder', folderSchema);

export default Folder;

