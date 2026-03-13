require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const users = require('./routes/users');
const products = require('./routes/products');
const orders = require('./routes/orders');

const app = express();
app.use(express.json());

app.use(helmet());

// ISSUE-0031: CORS too open in release
app.use(cors());

// ISSUE-0024: prevent server crash on invalid JSON
app.use(express.json());

// Handle invalid JSON payloads (fix for ISSUE-0024)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Return JSON error response instead of crashing
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// Handle invalid JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send('Invalid JSON payload');
  }
  next(err);
});

// ISSUE-0023: request logging missing in release (no morgan)
// ISSUE-0028: rate limiter missing in release
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// apply limiter only to auth login/register
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// existing auth routes
app.use('/api/auth', authRoutes);

// ISSUE-0035: /health endpoint missing in release

app.use('/users', users);
app.use('/products', products);
app.use('/orders', orders);

// ISSUE-0016/0030: error handling inconsistent and stack logging not improved
app.use((err, req, res, next) => {
  res.status(500).send('Server error');
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log('API running on port ${port}'));