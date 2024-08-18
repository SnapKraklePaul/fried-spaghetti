const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  orderID: {
    type: String,
    required: true,
    unique: true // Ensure orderID is unique
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  quizScore: {
    type: Number,
    default: null,
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

// Add an index for faster queries
orderSchema.index({ user: 1, product: 1, purchaseDate: -1 });

module.exports = mongoose.model('Order', orderSchema);