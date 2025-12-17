import mongoose, { Schema, Model, Document } from 'mongoose';

interface IComment extends Document {
  shareToken: string; // The shared template token
  userId?: mongoose.Types.ObjectId; // Optional - for logged-in users
  userName: string; // User name (or "Anonymous User")
  comment: string;
  position: {
    x: number; // X coordinate relative to the iframe
    y: number; // Y coordinate relative to the iframe
    elementSelector?: string; // Optional CSS selector of the element
  };
  resolved?: boolean; // Whether the comment is marked as resolved
  deleted?: boolean; // Whether the comment is deleted (soft delete)
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  shareToken: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userName: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    elementSelector: {
      type: String,
    },
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  deleted: {
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

// Index for faster lookups
commentSchema.index({ shareToken: 1, createdAt: -1 });

commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default Comment;

