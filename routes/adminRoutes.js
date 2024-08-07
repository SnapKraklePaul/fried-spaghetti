const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Quiz = require('../models/Quiz');
const Order = require('../models/Order');

// Admin dashboard home
// Update the existing admin dashboard route in adminRoutes.js

router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const quizCount = await Quiz.countDocuments();
    const orderCount = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$product.price' } } }
    ]);
    
    res.render('admin/dashboard', { 
      pageTitle: 'Admin Dashboard',
      userCount,
      productCount,
      quizCount,
      orderCount,
      totalSales: totalSales.length > 0 ? totalSales[0].total : 0
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.flash('error_msg', 'An error occurred while loading the admin dashboard');
    res.redirect('/');
  }
});

// User management
router.get('/admin/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || '';
    const query = searchQuery ? {
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {};

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit);

    res.render('admin/users', { 
      pageTitle: 'User Management', 
      users, 
      searchQuery,
      currentPage: page,
      totalPages,
      totalUsers
    });
  } catch (error) {
    console.error('User management error:', error);
    req.flash('error_msg', 'An error occurred while loading user management');
    res.redirect('/admin');
  }
});

// // User detail view
// router.get('/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password');
//     if (!user) {
//       req.flash('error_msg', 'User not found');
//       return res.redirect('/admin/users');
//     }
//     res.render('partials/user-details', { pageTitle: 'User Details', user });
//   } catch (error) {
//     console.error('User detail error:', error);
//     req.flash('error_msg', 'An error occurred while loading user details');
//     res.redirect('/admin/users');
//   }
// });

// User detail view
router.get('/admin/users/:id/details', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('purchasedCourses', 'title')
      .populate('completedCourses', 'title');
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    res.render('partials/admin/user-details', { user, pageTitle: 'User Detail' });
  } catch (error) {
    console.error('User detail error:', error);
    res.status(500).send('An error occurred while loading user details');
  }
});

// // Edit user form
// router.get('/admin/users/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password');
//     if (!user) {
//       req.flash('error_msg', 'User not found');
//       return res.redirect('/admin/users');
//     }
//     res.render('partials/user-edit-form', { pageTitle: 'Edit User', user });
//   } catch (error) {
//     console.error('Edit user form error:', error);
//     req.flash('error_msg', 'An error occurred while loading the edit user form');
//     res.redirect('/admin/users');
//   }
// });

// Edit user form
router.get('/admin/users/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
  try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
          return res.status(404).send('User not found');
      }
      res.render('partials/admin/user-edit-form', { user, pageTitle: 'Edit User' });
  } catch (error) {
      console.error('Edit user form error:', error);
      res.status(500).send('An error occurred while loading the edit user form');
  }
});

// Update user
router.post('/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, isAdmin } = req.body;
    await User.findByIdAndUpdate(req.params.id, { 
      firstName, 
      lastName, 
      email, 
      isAdmin: isAdmin === 'on'
    });
    req.flash('success_msg', 'User updated successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Update user error:', error);
    req.flash('error_msg', 'An error occurred while updating the user');
    res.redirect('/admin/users');
  }
});

// Delete user
router.post('/admin/users/:id/delete', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.flash('error_msg', 'An error occurred while deleting the user');
    res.redirect('/admin/users');
  }
});

// Product management
router.get('/admin/products', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || '';
    const query = searchQuery ? {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {};

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit);

    res.render('admin/products', { 
      pageTitle: 'Product Management', 
      products, 
      searchQuery,
      currentPage: page,
      totalPages,
      totalProducts
    });
  } catch (error) {
    console.error('Product management error:', error);
    req.flash('error_msg', 'An error occurred while loading product management');
    res.redirect('/admin');
  }
});

// Create product form
router.get('/admin/products/create', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/product-form', { pageTitle: 'Create Product', product: {} });
});

// Create product
router.post('/admin/products', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const product = new Product({ title, description, price });
    await product.save();
    req.flash('success_msg', 'Product created successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Create product error:', error);
    req.flash('error_msg', 'An error occurred while creating the product');
    res.redirect('/admin/products');
  }
});

// Product details (for expandable view)
router.get('/admin/products/:id/details', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('partials/admin/product-details', { product, pageTitle: 'Product Details' });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).send('An error occurred while loading product details');
  }
});

// Edit product form (for expandable view)
router.get('/admin/products/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('partials/admin/product-edit-form', { product, pageTitle: 'Edit Product' });
  } catch (error) {
    console.error('Edit product form error:', error);
    res.status(500).send('An error occurred while loading the edit product form');
  }
});

// Update product (AJAX)
router.post('/admin/products/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { title, description, price });
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'An error occurred while updating the product' });
  }
});

// Delete product
router.post('/admin/products/:id/delete', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Product deleted successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Delete product error:', error);
    req.flash('error_msg', 'An error occurred while deleting the product');
    res.redirect('/admin/products');
  }
});

// Quiz management
router.get('/admin/quizzes', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || '';
    const query = searchQuery ? {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {};

    const totalQuizzes = await Quiz.countDocuments(query);
    const totalPages = Math.ceil(totalQuizzes / limit);

    const quizzes = await Quiz.find(query)
      .populate('product')
      .skip(skip)
      .limit(limit);

    res.render('admin/quizzes', { 
      pageTitle: 'Quiz Management', 
      quizzes, 
      searchQuery,
      currentPage: page,
      totalPages,
      totalQuizzes
    });
  } catch (error) {
    console.error('Quiz management error:', error);
    req.flash('error_msg', 'An error occurred while loading quiz management');
    res.redirect('/admin');
  }
});

// Create quiz form
router.get('/admin/quizzes/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/quiz-form', { pageTitle: 'Create Quiz', quiz: {}, products });
  } catch (error) {
    console.error('Create quiz form error:', error);
    req.flash('error_msg', 'An error occurred while loading the create quiz form');
    res.redirect('/admin/quizzes');
  }
});

// Create quiz
router.post('/admin/quizzes', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, product, questions } = req.body;
    const quiz = new Quiz({ 
      title, 
      description, 
      product,
      questions: JSON.parse(questions)
    });
    await quiz.save();
    req.flash('success_msg', 'Quiz created successfully');
    res.redirect('/admin/quizzes');
  } catch (error) {
    console.error('Create quiz error:', error);
    req.flash('error_msg', 'An error occurred while creating the quiz');
    res.redirect('/admin/quizzes');
  }
});

// Quiz details (for expandable view)
router.get('/admin/quizzes/:id/details', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('product');
    if (!quiz) {
      return res.status(404).send('Quiz not found');
    }
    res.render('partials/admin/quiz-details', { quiz, pageTitle: 'Quiz Details' });
  } catch (error) {
    console.error('Quiz detail error:', error);
    res.status(500).send('An error occurred while loading quiz details');
  }
});

// Edit quiz form (for expandable view)
router.get('/admin/quizzes/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).send('Quiz not found');
    }
    const products = await Product.find();
    res.render('partials/admin/quiz-edit-form', { quiz, products, pageTitle: 'Edit Quiz' });
  } catch (error) {
    console.error('Edit quiz form error:', error);
    res.status(500).send('An error occurred while loading the edit quiz form');
  }
});

// Update quiz (AJAX)
router.post('/admin/quizzes/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, product, questions } = req.body;
    await Quiz.findByIdAndUpdate(req.params.id, {
      title,
      description,
      product,
      questions: JSON.parse(questions)
    });
    res.json({ success: true, message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, error: 'An error occurred while updating the quiz' });
  }
});

// Delete quiz
router.post('/admin/quizzes/:id/delete', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Quiz deleted successfully');
    res.redirect('/admin/quizzes');
  } catch (error) {
    console.error('Delete quiz error:', error);
    req.flash('error_msg', 'An error occurred while deleting the quiz');
    res.redirect('/admin/quizzes');
  }
});

// // Order management
// router.get('/admin/orders', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     const searchQuery = req.query.search || '';
//     const query = searchQuery ? {
//       $or: [
//         { orderID: { $regex: searchQuery, $options: 'i' } },
//         { paymentStatus: { $regex: searchQuery, $options: 'i' } }
//       ]
//     } : {};

//     const totalOrders = await Order.countDocuments(query);
//     const totalPages = Math.ceil(totalOrders / limit);

//     const orders = await Order.find(query)
//       .populate('user', 'firstName lastName email')
//       .populate('product', 'title price')
//       .sort({ purchaseDate: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.render('admin/orders', { 
//       pageTitle: 'Order Management', 
//       orders, 
//       searchQuery,
//       currentPage: page,
//       totalPages,
//       totalOrders
//     });
//   } catch (error) {
//     console.error('Order management error:', error);
//     req.flash('error_msg', 'An error occurred while loading order management');
//     res.redirect('/admin');
//   }
// });

// // Order detail view
// router.get('/admin/orders/:id', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('user', 'firstName lastName email')
//       .populate('product', 'title price');
    
//     if (!order) {
//       req.flash('error_msg', 'Order not found');
//       return res.redirect('/admin/orders');
//     }
    
//     res.render('admin/order-detail', { pageTitle: 'Order Details', order });
//   } catch (error) {
//     console.error('Order detail error:', error);
//     req.flash('error_msg', 'An error occurred while loading order details');
//     res.redirect('/admin/orders');
//   }
// });

// // Update order status
// router.post('/admin/orders/:id/update-status', isAuthenticated, isAdmin, async (req, res) => {
//   try {
//     const { paymentStatus } = req.body;
//     await Order.findByIdAndUpdate(req.params.id, { paymentStatus });
//     req.flash('success_msg', 'Order status updated successfully');
//     res.redirect('/admin/orders');
//   } catch (error) {
//     console.error('Update order status error:', error);
//     req.flash('error_msg', 'An error occurred while updating the order status');
//     res.redirect('/admin/orders');
//   }
// });

// Order management
router.get('/admin/orders', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || '';
    const query = searchQuery ? {
      $or: [
        { orderID: { $regex: searchQuery, $options: 'i' } },
        { paymentStatus: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {};

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('product', 'title price')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    res.render('admin/orders', {
      pageTitle: 'Order Management',
      orders,
      searchQuery,
      currentPage: page,
      totalPages,
      totalOrders
    });
  } catch (error) {
    console.error('Order management error:', error);
    req.flash('error_msg', 'An error occurred while loading order management');
    res.redirect('/admin');
  }
});

// Order detail view
router.get('/admin/orders/:id/details', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('product', 'title price');

    if (!order) {
      return res.status(404).send('Order not found');
    }

    res.render('partials/admin/order-details', { order, pageTitle: 'Order Details' });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).send('An error occurred while loading order details');
  }
});

// Monthly sales report
// Generate sales report (JSON response for AJAX request)
router.get('/admin/sales-report', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const orders = await Order.find({
      purchaseDate: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    }).populate('product', 'title price');

    const totalSales = orders.reduce((total, order) => total + order.product.price, 0);
    const orderCount = orders.length;

    res.json({ 
      totalSales, 
      orderCount, 
      orders: orders.map(order => ({
        orderID: order.orderID,
        product: {
          title: order.product.title,
          price: order.product.price
        },
        purchaseDate: order.purchaseDate
      }))
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'An error occurred while generating the sales report' });
  }
});


router.get('/admin/users/:id/details', isAuthenticated, isAdmin, async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).send('User not found');
      }
      res.render('admin/user-detail', { user, pageTitle: 'Admin Dashboard' }, (err, html) => {
          if (err) {
              console.error(err);
              res.status(500).send('Error rendering user details');
          } else {
              res.send(html);
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});

router.get('/admin/users/:id/edit-form', isAuthenticated, isAdmin, async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).send('User not found');
      }
      res.render('partials/user-edit-form', { user, pageTitle: 'Admin Dashboard' }, (err, html) => {
          if (err) {
              console.error(err);
              res.status(500).send('Error rendering user edit form');
          } else {
              res.send(html);
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});

module.exports = router;



