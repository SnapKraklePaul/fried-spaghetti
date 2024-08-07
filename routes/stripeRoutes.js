const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', isAuthenticated, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.session.cart.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100, // Stripe expects amounts in cents
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'An error occurred during checkout' });
  }
});

module.exports = router;