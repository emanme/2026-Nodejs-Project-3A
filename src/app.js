require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const users = require('./routes/users');
const products = require('./routes/products');
const orders = require('./routes/orders');

const app = express();

app.use(helmet());
app.use(cors({ origin: false }));
app.use(morgan('dev'));

app.use(express.json({ strict: true }));

const authLimiter = rateLimit({ windowMs: 60_000, max: 30 });
app.use('/users', authLimiter);

app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/users', users);
app.use('/products', products);
app.use('/orders', orders);

app.use((err, req, res, next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: { code: 'SERVER', message: 'Unexpected error' } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API running on port ${port}`));
