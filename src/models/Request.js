import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    trim: true
  },
  scheduledPickupDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
requestSchema.index({ receiver: 1, status: 1 });
requestSchema.index({ donor: 1, status: 1 });
requestSchema.index({ item: 1 });

const Request = mongoose.model('Request', requestSchema);

export default Request;
