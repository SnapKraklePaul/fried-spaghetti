const express = require('express');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const { isAuthenticated } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');

// PayPal configuration
let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
let client = new paypal.core.PayPalHttpClient(environment);

router.post('/create-paypal-transaction', isAuthenticated, async (req, res) => {
  try {
    let request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: req.session.cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)
        }
      }]
    });

    let order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error('PayPal create transaction error:', error);
    res.status(500).json({ error: 'An error occurred during checkout' });
  }
});

router.post('/capture-paypal-transaction', isAuthenticated, async (req, res) => {
  const orderId = req.body.orderId;

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await client.execute(request);
    
    const user = req.user;
    const cartItems = req.session.cart;

    for (const item of cartItems) {
      const order = new Order({
        user: user._id,
        product: item._id,
        orderID: capture.result.id,
        paymentStatus: 'completed',
      });
      await order.save();

      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { purchasedCourses: item._id } },
        { new: true }
      );
    }

    req.session.cart = [];
    req.session.lastCompletedOrder = capture.result.id;
    
    res.json({ success: true, redirectUrl: '/paypal/confirmation' });
  } catch (error) {
    console.error('PayPal capture transaction error:', error);
    res.status(500).json({ error: 'An error occurred during payment capture', details: error.message });
  }
});

router.get('/paypal/confirmation', isAuthenticated, async (req, res) => {
  const orderId = req.session.lastCompletedOrder;
  if (!orderId) {
    return res.redirect('/');
  }

  try {
    const order = await Order.findOne({ orderID: orderId }).populate('product');
    
    if (!order) {
      req.flash('error_msg', 'Order not found');
      return res.redirect('/');
    }

    // Clear the cart and remove the lastCompletedOrder from the session
    req.session.cart = [];
    delete req.session.lastCompletedOrder;

    res.render('payment-confirmation', { 
      order,
      pageTitle: 'Payment Confirmation'
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    req.flash('error_msg', 'An error occurred while fetching your order');
    res.redirect('/');
  }
});

router.get('/paypal/failure', (req, res) => {
  res.render('payment-failure');
});

module.exports = router;