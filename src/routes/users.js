const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { register, login, me } = require('../controllers/userController');


const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(1) // ISSUE-0008 weak policy in release
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, me);

// ISSUE-0029 Password reset feature missing
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  return res.json({
    message: 'Password reset link sent (mock implementation)'
  });
});

router.post('/reset-password', (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  return res.json({
    message: 'Password has been reset successfully (mock implementation)'
  });
});

module.exports = router;