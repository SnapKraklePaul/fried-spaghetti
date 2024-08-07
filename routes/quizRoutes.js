const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Product = require('../models/Product');

const PASSING_PERCENTAGE = 70;

router.get('/quiz/:courseId', isAuthenticated, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const quiz = await Quiz.findOne({ product: courseId });
    
    if (!quiz) {
      req.flash('error_msg', 'Quiz not found for this course');
      return res.redirect(`/course/${courseId}`);
    }

    res.render('quiz', { 
      pageTitle: 'Course Quiz',
      quiz: quiz,
      courseId: courseId
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    req.flash('error_msg', 'An error occurred while loading the quiz');
    res.redirect(`/course/${req.params.courseId}`);
  }
});

router.post('/submit-quiz/:courseId', isAuthenticated, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const quiz = await Quiz.findOne({ product: courseId });
    const course = await Product.findById(courseId);
    if (!quiz || !course) {
      req.flash('error_msg', 'Quiz or course not found');
      return res.redirect(`/course/${courseId}`);
    }

    const userAnswers = req.body;
    let score = 0;
    let totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (parseInt(userAnswers[`question${index}`]) === question.correctAnswer) {
        score++;
      }
    });

    const percentageScore = (score / totalQuestions) * 100;

    // Update user's quiz score
    await User.findByIdAndUpdate(req.user._id, {
      $set: { [`quizScores.${courseId}`]: percentageScore }
    });

    const passed = percentageScore >= PASSING_PERCENTAGE;

    if (passed) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { completedCourses: courseId }
      });
      
      res.redirect(`/certificate/${courseId}`);
    } else {
      req.flash('info_msg', `Your score: ${percentageScore.toFixed(2)}%. You need ${PASSING_PERCENTAGE}% to pass. Keep studying and try again.`);
      res.redirect(`/course/${courseId}`);
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
    req.flash('error_msg', 'An error occurred while submitting the quiz');
    res.redirect(`/course/${req.params.courseId}`);
  }
});

module.exports = router;