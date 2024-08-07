const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

// Checkout page
router.get('/checkout', isAuthenticated, (req, res) => {
  res.render('checkout', { 
    pageTitle: 'Checkout',
    cartItems: req.session.cart,
    total: req.session.cart.reduce((sum, item) => sum + item.price, 0)
  });
});

// Stripe checkout
router.get('/checkout/stripe', isAuthenticated, (req, res) => {
  res.render('checkout-stripe', { 
    pageTitle: 'Stripe Checkout',
    cartItems: req.session.cart,
    total: req.session.cart.reduce((sum, item) => sum + item.price, 0)
  });
});

// PayPal checkout
router.get('/checkout/paypal', isAuthenticated, (req, res) => {
  res.render('checkout-paypal', { 
    pageTitle: 'PayPal Checkout',
    cartItems: req.session.cart,
    total: req.session.cart.reduce((sum, item) => sum + item.price, 0)
  });
});

module.exports = router;