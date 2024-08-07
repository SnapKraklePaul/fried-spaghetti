const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Add to cart
router.post('/cart/add', async (req, res) => {
  try {
    const productId = req.body.productId;
    const product = await Product.findById(productId);
    
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/courses');
    }

    // Check if the product is already in the cart
    const existingItem = req.session.cart.find(item => item._id.toString() === productId);
    
    if (!existingItem) {
      // If not in cart, add it
      req.session.cart.push({
        _id: product._id,
        title: product.title,
        price: product.price,
      });
      req.flash('success_msg', 'Product added to cart');
    } else {
      req.flash('info_msg', 'Product is already in your cart');
    }
    
    res.redirect('/cart');
  } catch (error) {
    console.error('Add to cart error:', error);
    req.flash('error_msg', 'Error adding product to cart');
    res.redirect('/courses');
  }
});

// View cart
router.get('/cart', (req, res) => {
  res.render('cart', { 
    pageTitle: 'Your Cart',
    cartItems: req.session.cart,
    total: req.session.cart.reduce((sum, item) => sum + item.price, 0)
  });
});

// Remove from cart
router.post('/cart/remove', (req, res) => {
  const productId = req.body.productId;
  req.session.cart = req.session.cart.filter(item => item._id.toString() !== productId);
  req.flash('success_msg', 'Product removed from cart');
  res.redirect('/cart');
});

module.exports = router;