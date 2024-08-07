// require('dotenv').config();
// const express = require('express');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const flash = require('connect-flash');
// const path = require('path');
// const expressLayouts = require('express-ejs-layouts');
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const userRoutes = require('./routes/userRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const stripeRoutes = require('./routes/stripeRoutes');
// const paypalRoutes = require('./routes/paypalRoutes');
// const courseRoutes = require('./routes/courseRoutes');
// const { isAuthenticated } = require('./middleware/authMiddleware');
// const indexRouter = require('./routes/index');
// const User = require('./models/User');

// const app = express();
// const port = process.env.PORT || 3000;

// // Enable CORS
// app.use(cors());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch((err) => console.error('MongoDB connection error:', err));

// // Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(cookieParser());
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
// }));

// // Add this middleware to create a cart in the session if it doesn't exist
// app.use((req, res, next) => {
//   if (!req.session.cart) {
//     req.session.cart = [];
//   }
//   res.locals.cartItemCount = req.session.cart.length;
//   next();
// });
// app.use(flash());
// app.use(express.static(path.join(__dirname, 'public')));

// // Set EJS as the view engine and use layouts
// app.set('view engine', 'ejs');
// app.use(expressLayouts);
// app.set('layout', 'layout');

// // Global variables for flash messages
// app.use((req, res, next) => {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next();
// });

// // Add this middleware before your routes
// app.use(async (req, res, next) => {
//   res.locals.user = null;
//   const token = req.cookies.token;
//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.userId);
//       if (user) {
//         res.locals.user = user;
//       }
//     } catch (error) {
//       console.error('Error verifying token:', error);
//     }
//   }
//   next();
// });

// app.use(async (req, res, next) => {
//   if (req.cookies.token) {
//     try {
//       const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.userId);
//     } catch (error) {
//       console.error('Error verifying token:', error);
//     }
//   }
//   next();
// });

// // Routes
// app.use('/', indexRouter);
// app.use('/', userRoutes);
// app.use('/', adminRoutes);
// app.use('/', cartRoutes);
// app.use('/', paymentRoutes);
// app.use('/', stripeRoutes);
// app.use('/', paypalRoutes);
// app.use('/', courseRoutes); 

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500);
//   res.render('error', {
//     pageTitle: 'Error',
//     message: err.message || 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err : {}
//   });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });


require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const paypalRoutes = require('./routes/paypalRoutes');
const { isAuthenticated } = require('./middleware/authMiddleware');
const indexRouter = require('./routes/index');
const User = require('./models/User');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply the rate limiting middleware to all requests
// app.use(globalLimiter);

// Enable CORS
app.use(cors());

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch((err) => console.error('MongoDB connection error:', err));
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// Add this middleware to create a cart in the session if it doesn't exist
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.locals.cartItemCount = req.session.cart.length;
  next();
});

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine and use layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Add this middleware before your routes
app.use(async (req, res, next) => {
  res.locals.user = null;
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        res.locals.user = user;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }
  next();
});

app.use(async (req, res, next) => {
  if (req.cookies.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId);
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/', userRoutes);
app.use('/', adminRoutes);
app.use('/', cartRoutes);
app.use('/', paymentRoutes);
app.use('/', stripeRoutes);
app.use('/', paypalRoutes);
app.use('/', courseRoutes);
app.use('/', quizRoutes);
app.use('/', certificateRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    pageTitle: 'Error',
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});