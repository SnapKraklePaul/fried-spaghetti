const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/emailHandler');

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

router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { 
    pageTitle: 'Privacy Policy',
    user: req.user
  });
});

router.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', { 
    pageTitle: 'Terms of Service',
    user: req.user
  });
});

// New email route
router.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;
  const result = await sendEmail(name, email, message);
  
  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message });
  }
});

module.exports = router;