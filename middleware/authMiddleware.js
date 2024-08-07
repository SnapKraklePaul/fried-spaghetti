const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        req.flash('error_msg', 'User not found. Please log in again.');
        return res.redirect('/login');
      }
      req.user = user;
      req.userId = user._id;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      req.flash('error_msg', 'Authentication failed. Please log in again.');
      res.redirect('/login');
    }
  } else {
    req.flash('error_msg', 'Please log in to access this page.');
    res.redirect('/login');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    req.flash('error_msg', 'Access denied. Admin privileges required.');
    res.redirect('/');
  }
};

module.exports = { isAuthenticated, isAdmin };