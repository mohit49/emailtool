import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITicketComment {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  comment: string;
  images?: string[]; // Array of image URLs
  createdAt: Date;
}

export interface ITicketTimeline {
  type: 'status' | 'priority' | 'assignment' | 'comment';
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  oldValue?: string;
  newValue: string;
  comment?: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  images?: string[]; // Array of image URLs for the main ticket
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: mongoose.Types.ObjectId;
  assignedUsers: mongoose.Types.ObjectId[]; // Users who can update the ticket
  comments: ITicketComment[];
  timeline: ITicketTimeline[]; // Timeline of all changes
  createdAt: Date;
  updatedAt: Date;
}

const ticketCommentSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const supportTicketSchema = new Schema<ISupportTicket>({
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [ticketCommentSchema],
  timeline: [{
    type: {
      type: String,
      enum: ['status', 'priority', 'assignment', 'comment'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    oldValue: {
      type: String,
    },
    newValue: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster lookups
supportTicketSchema.index({ createdBy: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ assignedUsers: 1 });
supportTicketSchema.index({ ticketNumber: 1 });

supportTicketSchema.pre('save', async function(next) {
  // Generate ticket number if not set
  if (!this.ticketNumber) {
    let ticketNum: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;
    
    // Get the model using this.constructor or mongoose.models
    const SupportTicketModel = (this.constructor as mongoose.Model<ISupportTicket>) || mongoose.models.SupportTicket;
    
    // Generate a 5-digit ticket number (10000-99999)
    while (!isUnique && attempts < maxAttempts) {
      // Generate random 5-digit number
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 10000 to 99999
      ticketNum = randomNum.toString();
      
      // Check if it already exists
      try {
        if (SupportTicketModel) {
          const existing = await SupportTicketModel.findOne({ ticketNumber: ticketNum });
          if (!existing) {
            isUnique = true;
          }
        } else {
          // If model not available, assume unique (shouldn't happen but safety check)
          isUnique = true;
        }
      } catch (err) {
        // If query fails, try again
        console.error('Error checking ticket number uniqueness:', err);
      }
      attempts++;
    }
    
    if (!isUnique || !ticketNum) {
      // Fallback: use timestamp-based 5-digit number
      const timestamp = Date.now();
      // Get last 5 digits of timestamp, ensure it's 5 digits
      ticketNum = String(timestamp % 100000).padStart(5, '0');
      
      // Double check this one if model is available
      if (SupportTicketModel) {
        try {
          const existing = await SupportTicketModel.findOne({ ticketNumber: ticketNum });
          if (existing) {
            // If still exists, use a combination
            ticketNum = String((timestamp % 90000) + 10000);
          }
        } catch (err) {
          // Continue with timestamp-based number
        }
      }
    }
    
    this.ticketNumber = ticketNum;
  }
  
  this.updatedAt = new Date();
  next();
});

const SupportTicket: Model<ISupportTicket> = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);

export default SupportTicket;
