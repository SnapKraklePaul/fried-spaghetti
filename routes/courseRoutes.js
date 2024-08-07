// const express = require('express');
// const router = express.Router();
// const { isAuthenticated } = require('../middleware/authMiddleware');
// const Product = require('../models/Product');
// const Quiz = require('../models/Quiz');
// const User = require('../models/User');
// const PDFDocument = require('pdfkit');

// const PASSING_PERCENTAGE = 70;

// router.get('/course/:id', isAuthenticated, async (req, res) => {
//   try {
//     const course = await Product.findById(req.params.id);
//     if (!course) {
//       req.flash('error_msg', 'Course not found');
//       return res.redirect('/profile');
//     }
    
//     res.render('course-content', { 
//       pageTitle: course.title,
//       course: course,
//       user: req.user,
//       messages: req.flash()
//     });
//   } catch (error) {
//     console.error('Error fetching course:', error);
//     req.flash('error_msg', 'An error occurred while fetching the course');
//     res.redirect('/profile');
//   }
// });

// router.get('/quiz/:courseId', isAuthenticated, async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const quiz = await Quiz.findOne({ product: courseId });
    
//     if (!quiz) {
//       req.flash('error_msg', 'Quiz not found for this course');
//       return res.redirect(`/course/${courseId}`);
//     }

//     res.render('quiz', { 
//       pageTitle: 'Course Quiz',
//       quiz: quiz,
//       courseId: courseId
//     });
//   } catch (error) {
//     console.error('Error fetching quiz:', error);
//     req.flash('error_msg', 'An error occurred while loading the quiz');
//     res.redirect(`/course/${req.params.courseId}`);
//   }
// });

// router.post('/submit-quiz/:courseId', isAuthenticated, async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const quiz = await Quiz.findOne({ product: courseId });
//     const course = await Product.findById(courseId);
//     if (!quiz || !course) {
//       req.flash('error_msg', 'Quiz or course not found');
//       return res.redirect(`/course/${courseId}`);
//     }

//     const userAnswers = req.body;
//     let score = 0;
//     let totalQuestions = quiz.questions.length;

//     quiz.questions.forEach((question, index) => {
//       if (parseInt(userAnswers[`question${index}`]) === question.correctAnswer) {
//         score++;
//       }
//     });

//     const percentageScore = (score / totalQuestions) * 100;

//     // Update user's quiz score
//     await User.findByIdAndUpdate(req.user._id, {
//       $set: { [`quizScores.${courseId}`]: percentageScore }
//     });

//     const passed = percentageScore >= PASSING_PERCENTAGE;

//     if (passed) {
//       await User.findByIdAndUpdate(req.user._id, {
//         $addToSet: { completedCourses: courseId }
//       });
      
//       res.redirect(`/certificate/${courseId}`);
//     } else {
//       req.flash('info_msg', `Your score: ${percentageScore.toFixed(2)}%. You need ${PASSING_PERCENTAGE}% to pass. Keep studying and try again.`);
//       res.redirect(`/course/${courseId}`);
//     }
//   } catch (error) {
//     console.error('Error submitting quiz:', error);
//     req.flash('error_msg', 'An error occurred while submitting the quiz');
//     res.redirect(`/course/${req.params.courseId}`);
//   }
// });

// router.get('/certificate/:courseId', isAuthenticated, async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const course = await Product.findById(courseId);
//     const user = req.user;

//     if (!course || !user.completedCourses.includes(courseId)) {
//       req.flash('error_msg', 'Certificate not available');
//       return res.redirect(`/course/${courseId}`);
//     }

//     const score = user.quizScores.get(courseId);

//     res.render('certificate', {
//       pageTitle: 'Course Certificate',
//       course: course,
//       user: user,
//       score: score
//     });
//   } catch (error) {
//     console.error('Error fetching certificate:', error);
//     req.flash('error_msg', 'An error occurred while fetching the certificate');
//     res.redirect('/profile');
//   }
// });

// router.get('/download-certificate/:courseId', isAuthenticated, async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const course = await Product.findById(courseId);
//     const user = req.user;

//     if (!course || !user.completedCourses.includes(courseId)) {
//       req.flash('error_msg', 'Certificate not available');
//       return res.redirect(`/course/${courseId}`);
//     }

//     const score = user.quizScores.get(courseId);
//     const pdfBuffer = await generateCertificatePDF(user, course, score);

//     res.contentType('application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('Error downloading certificate:', error);
//     req.flash('error_msg', 'An error occurred while downloading the certificate');
//     res.redirect(`/certificate/${req.params.courseId}`);
//   }
// });

// async function generateCertificatePDF(user, course, score) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({
//       layout: 'landscape',
//       size: 'A4',
//     });

//     const buffers = [];
//     doc.on('data', buffers.push.bind(buffers));
//     doc.on('end', () => {
//       const pdfData = Buffer.concat(buffers);
//       resolve(pdfData);
//     });

//     // Add content to PDF
//     doc.font('Helvetica-Bold').fontSize(30).text('Certificate of Completion', {align: 'center'});
//     doc.moveDown();
//     doc.font('Helvetica').fontSize(20).text(`This certifies that ${user.firstName} ${user.lastName}`, {align: 'center'});
//     doc.moveDown();
//     doc.fontSize(16).text(`has successfully completed the course`, {align: 'center'});
//     doc.moveDown();
//     doc.font('Helvetica-Bold').fontSize(24).text(`${course.title}`, {align: 'center'});
//     doc.moveDown();
//     doc.font('Helvetica').fontSize(16).text(`with a score of ${score.toFixed(2)}%`, {align: 'center'});
//     doc.moveDown();
//     doc.fontSize(14).text(`Issued on: ${new Date().toLocaleDateString()}`, {align: 'center'});

//     doc.end();
//   });
// }

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { isAuthenticated } = require('../middleware/authMiddleware');
// const Product = require('../models/Product');
// const User = require('../models/User');

// // Course listing
// router.get('/courses', async (req, res) => {
//   try {
//     const courses = await Product.find();
//     let userPurchasedCourses = [];

//     if (req.user) {
//       const user = await User.findById(req.user._id).populate('purchasedCourses');
//       userPurchasedCourses = user.purchasedCourses.map(course => course._id.toString());
//     }

//     res.render('courses', {
//       pageTitle: 'Our Courses',
//       courses,
//       user: req.user,
//       userPurchasedCourses
//     });
//   } catch (error) {
//     console.error('Error fetching courses:', error);
//     req.flash('error_msg', 'Unable to load courses. Please try again later.');
//     res.redirect('/');
//   }
// });

// // Course detail
// router.get('/courses/:id', async (req, res) => {
//   try {
//     const course = await Product.findById(req.params.id);
//     if (!course) {
//       req.flash('error_msg', 'Course not found');
//       return res.redirect('/courses');
//     }

//     let isPurchased = false;
//     if (req.user) {
//       const user = await User.findById(req.user._id).populate('purchasedCourses');
//       isPurchased = user.purchasedCourses.some(purchasedCourse => 
//         purchasedCourse._id.toString() === course._id.toString()
//       );
//     }

//     res.render('course-detail', {
//       pageTitle: course.title,
//       course,
//       user: req.user,
//       isPurchased
//     });
//   } catch (error) {
//     console.error('Error fetching course details:', error);
//     req.flash('error_msg', 'Unable to load course details. Please try again later.');
//     res.redirect('/courses');
//   }
// });

// // Course content (for purchased courses)
// router.get('/course/:id', isAuthenticated, async (req, res) => {
//   try {
//     const course = await Product.findById(req.params.id);
//     if (!course) {
//       req.flash('error_msg', 'Course not found');
//       return res.redirect('/profile');
//     }
    
//     res.render('course-content', { 
//       pageTitle: course.title,
//       course: course,
//       user: req.user,
//       messages: req.flash()
//     });
//   } catch (error) {
//     console.error('Error fetching course:', error);
//     req.flash('error_msg', 'An error occurred while fetching the course');
//     res.redirect('/profile');
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/courses', async (req, res) => {
  try {
    const courses = await Product.find();
    let userPurchasedCourses = [];

    if (req.user) {
      const user = await User.findById(req.user._id).populate('purchasedCourses');
      userPurchasedCourses = user.purchasedCourses.map(course => course._id.toString());
    }

    res.render('courses/courses', {
      pageTitle: 'Our Courses',
      courses,
      user: req.user,
      userPurchasedCourses,
      activeContent: 'overview',
      activeCourse: null // Add this line
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    req.flash('error_msg', 'Unable to load courses. Please try again later.');
    res.redirect('/');
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Product.findById(req.params.id);
    const courses = await Product.find(); // For the sidebar
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/courses');
    }

    let isPurchased = false;
    if (req.user) {
      const user = await User.findById(req.user._id).populate('purchasedCourses');
      isPurchased = user.purchasedCourses.some(purchasedCourse => 
        purchasedCourse._id.toString() === course._id.toString()
      );
    }

    res.render('courses/courses', {
      pageTitle: course.title,
      courses,
      activeCourse: course,
      user: req.user,
      isPurchased,
      activeContent: 'detail',
      userPurchasedCourses: [] // Add this line
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    req.flash('error_msg', 'Unable to load course details. Please try again later.');
    res.redirect('/courses');
  }
});

router.get('/course/:id', isAuthenticated, async (req, res) => {
  try {
    const course = await Product.findById(req.params.id);
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/profile');
    }

    // Check if the user has purchased this course
    const user = await User.findById(req.user._id);
    if (!user.purchasedCourses.includes(course._id)) {
      req.flash('error_msg', 'You have not purchased this course');
      return res.redirect('/profile');
    }

    res.render('courses/course-content', {
      pageTitle: course.title,
      course: course,
      user: req.user,
      messages: req.flash() // Add this line to include flash messages
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    req.flash('error_msg', 'An error occurred while fetching the course');
    res.redirect('/profile');
  }
});

module.exports = router;