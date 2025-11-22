import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['book', 'notebook', 'pen', 'pencil', 'calculator', 'ruler', 'eraser', 'other']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  images: [{
    type: String
  }],
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'donated'],
    default: 'available'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required']
  }
}, {
  timestamps: true
});

// Index for better search performance
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });
itemSchema.index({ category: 1, status: 1 });

const Item = mongoose.model('Item', itemSchema);

export default Item;
