const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  questions: [questionSchema],
  // Reference to the associated product (course)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);