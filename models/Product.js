const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  overview: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  detailedDescription: {
    type: String,
    required: true
  },
  topicsCovered: {
    type: String,
    required: true
  },
  classDetails: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);