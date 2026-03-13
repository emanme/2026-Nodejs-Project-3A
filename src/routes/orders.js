const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { create, list } = require('../controllers/orderController');

const router = express.Router();

 0009-caayohanm-order-input-validation
// Validation schema for creating an order
const createSchema = z.object({
const orderSchema = z.object({
 release
  body: z.object({
    items: z.array(
      z.object({
        product_id: z.coerce.number().int().min(1),
        quantity: z.coerce.number().int().min(1),
      })
    ).min(1, "Order must contain at least one item"),
  }),
});

 0009-caayohanm-order-input-validation
// --------------------
// Routes
// --------------------

// POST /orders → Auth + Validation + Controller
router.post('/', auth, validate(createSchema), create);

// GET /orders → Auth + Controller

// ensure validation middleware runs before controller
router.post('/', auth, validate(orderSchema), create); // ISSUE-0020 + ISSUE-0009
 release
router.get('/', auth, list);

module.exports = router;