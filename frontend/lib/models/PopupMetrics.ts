import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPopupMetrics extends Document {
  activityId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  eventType: 'impression' | 'click' | 'close';
  visitorId: string; // UUID stored in cookie
  elementSelector?: string; // For click events - which element was clicked
  elementText?: string; // Text content of clicked element
  url: string; // URL where event occurred
  userAgent?: string;
  ipAddress?: string;
  isUniqueVisitor: boolean; // First time this visitor saw the popup
  isRepeatVisitor: boolean; // Visitor has seen this popup before
  timestamp: Date;
  metadata?: {
    [key: string]: any; // Additional metadata
  };
  createdAt: Date;
}

const popupMetricsSchema = new Schema<IPopupMetrics>({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PopupActivity',
    required: true,
    index: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    enum: ['impression', 'click', 'close'],
    required: true,
    index: true,
  },
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  elementSelector: {
    type: String,
    trim: true,
  },
  elementText: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  isUniqueVisitor: {
    type: Boolean,
    default: false,
  },
  isRepeatVisitor: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for efficient queries
popupMetricsSchema.index({ activityId: 1, eventType: 1 });
popupMetricsSchema.index({ activityId: 1, visitorId: 1 });
popupMetricsSchema.index({ activityId: 1, timestamp: -1 });
popupMetricsSchema.index({ projectId: 1, timestamp: -1 });

const PopupMetrics: Model<IPopupMetrics> = mongoose.models.PopupMetrics || mongoose.model<IPopupMetrics>('PopupMetrics', popupMetricsSchema);

export default PopupMetrics;








