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
    trigger: 'exitIntent' | 'pageLoad' | 'timeout' | 'elementExists';
    timeout?: number;
    elementSelector?: string;
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
