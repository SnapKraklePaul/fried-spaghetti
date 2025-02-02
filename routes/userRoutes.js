const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiter for profile updates
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many profile update attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/register');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/register');
  }
});

router.get('/register', (req, res) => {
  res.render('register', { pageTitle: 'Register' });
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token);
    req.flash('success_msg', 'You are now logged in');
    res.redirect('/profile');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'An error occurred during login');
    res.redirect('/login');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { pageTitle: 'Login' });
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

// Profile route
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('purchasedCourses');
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/');
    }
    res.render('profile', { pageTitle: 'Profile', user });
  } catch (error) {
    console.error('Profile error:', error);
    req.flash('error_msg', 'An error occurred while loading your profile');
    res.redirect('/');
  }
});

// Profile update route
router.post('/profile', isAuthenticated, profileUpdateLimiter, async (req, res) => {
  console.log('Received profile update request:', req.body);
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const { firstName, lastName, email, currentPassword, newPassword, confirmPassword, updateField } = req.body;

    console.log('Update field:', updateField);

    let updateMessage = 'Profile updated successfully';

    switch (updateField) {
      case 'basicInfo':
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email && email !== user.email) {
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return res.json({ success: false, message: 'Email already in use' });
          }
          user.email = email;
        }
        break;

      case 'password':
        if (newPassword && newPassword === confirmPassword) {
          const isMatch = await bcrypt.compare(currentPassword, user.password);
          if (!isMatch) {
            return res.json({ success: false, message: 'Invalid current password' });
          }
          user.password = await bcrypt.hash(newPassword, 10);
          updateMessage = 'Password updated successfully';
        } else if (newPassword !== confirmPassword) {
          return res.json({ success: false, message: 'New password and confirmation do not match' });
        } else {
          return res.json({ success: false, message: 'New password is required' });
        }
        break;

      default:
        console.log('Invalid update field:', updateField);
        return res.json({ success: false, message: 'Invalid update field' });
    }

    await user.save();
    res.json({ success: true, message: updateMessage });
  } catch (error) {
    console.error('Profile update error:', error);
    res.json({ success: false, message: 'An error occurred while updating your profile' });
  }
});

module.exports = router;