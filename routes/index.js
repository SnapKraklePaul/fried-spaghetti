// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');
// const User = require('../models/User');

// router.get('/', (req, res) => {
//   res.render('home', { pageTitle: 'Home' });
// });

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

// router.get('/resources', (req, res) => {
//   res.render('resources', { 
//     pageTitle: 'Learning Resources',
//     user: req.user
//   });
// });

// // FAQ route
// router.get('/faq', (req, res) => {
//   res.render('faq', { 
//     pageTitle: 'Frequently Asked Questions',
//     user: req.user
//   });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', { pageTitle: 'Home' });
});

router.get('/resources', (req, res) => {
  res.render('resources', { 
    pageTitle: 'Learning Resources',
    user: req.user
  });
});

router.get('/faq', (req, res) => {
  res.render('faq', { 
    pageTitle: 'Frequently Asked Questions',
    user: req.user
  });
});

module.exports = router;