import mongoose, { Schema, Model, Document } from 'mongoose';

export interface UrlCondition {
  type: 'contains' | 'equals' | 'landing' | 'startsWith' | 'doesNotContain';
  value: string;
  domain?: string; // Optional domain name before URLs
}

export interface IPopupActivity extends Document {
  name: string;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  urlConditions: UrlCondition[];
  logicOperator: 'AND' | 'OR';
  html: string;
  status: 'draft' | 'deactivated' | 'activated';
  popupSettings?: {
    enabled: boolean;
    trigger: 'exitIntent' | 'pageLoad' | 'timeout' | 'elementExists' | 'scrollPercentage';
    timeout?: number; // For setTimeout trigger (in milliseconds)
    elementSelector?: string; // For elementExists trigger (CSS selector)
    inactivityTimeout?: number; // For exit intent trigger (seconds of inactivity)
    scrollPercentage?: number; // For scrollPercentage trigger (0-100)
    cookieEnabled?: boolean; // Enable cookie-based close state remembering
    cookieExpiry?: number; // Cookie expiry in days (if cookieEnabled is true)
    sessionEnabled?: boolean; // Enable session-based close state remembering
    // Exit Intent Smart Trigger Rules
    exitIntentMinTimeOnPage?: number; // Minimum seconds user must be on page before exit-intent can trigger
    exitIntentMinScrollPercentage?: number; // Minimum scroll percentage (0-100) before exit-intent can trigger
    // Exit Intent Frequency Control
    exitIntentCooldownDays?: number; // Days to wait before showing exit-intent popup again (default: 7)
    exitIntentMaxPerSession?: number; // Maximum times to show exit-intent popup per session (default: 1)
    position?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom' | 'center-top' | 'center' | 'center-bottom';
    backdropEnabled?: boolean;
    backdropColor?: string;
    backdropOpacity?: number;
    width?: string;
    height?: string;
    backgroundColor?: string;
    borderRadiusTopLeft?: string;
    borderRadiusTopRight?: string;
    borderRadiusBottomLeft?: string;
    borderRadiusBottomRight?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    boxShadow?: string;
    animation?: string;
    closeAnimation?: string;
    showCloseButton?: boolean;
    closeButtonColor?: string;
    closeButtonSize?: string;
    closeButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    zIndex?: number;
    backdropZIndex?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const urlConditionSchema = new Schema<UrlCondition>({
  type: {
    type: String,
    enum: ['contains', 'equals', 'landing', 'startsWith', 'doesNotContain'],
    required: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  domain: {
    type: String,
    trim: true,
  },
}, { _id: false });

const popupActivitySchema = new Schema<IPopupActivity>({
  name: {
    type: String,
    required: true,
    trim: true,
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
  urlConditions: {
    type: [urlConditionSchema],
    default: [],
  },
  logicOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'OR',
  },
  html: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'deactivated', 'activated'],
    default: 'draft',
  },
  popupSettings: {
    type: Schema.Types.Mixed,
    default: {},
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

popupActivitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for faster queries
popupActivitySchema.index({ projectId: 1 });
popupActivitySchema.index({ userId: 1 });
popupActivitySchema.index({ status: 1 });

const PopupActivity: Model<IPopupActivity> = mongoose.models.PopupActivity || mongoose.model<IPopupActivity>('PopupActivity', popupActivitySchema);

export default PopupActivity;
