require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const users = require('./routes/users');
const products = require('./routes/products');
const orders = require('./routes/orders');

const app = express();

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

// ISSUE-0035: /health endpoint missing in release

app.use('/users', users);
app.use('/products', products);
app.use('/orders', orders);

// ISSUE-0016/0030: error handling inconsistent and stack logging not improved
// Improved Error Logging Middleware - Issue 0030
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const timestamp = new Date().toISOString();

  // Detailed log for the terminal
  console.error(`[${timestamp}] ${req.method} ${req.url} - Error: ${err.message}`);

  // Log stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log('API running on port ${port}'));