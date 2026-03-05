const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { apiError } = require('../utils/errors');
const { userModel } = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

async function register(req, res) {
  try {
    const { email, name, password } = req.validated.body;
    const existing = await userModel.findByEmail(email);
    if (existing) return apiError(res, 409, 'DUPLICATE', 'Email already exists');

    const password_hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ email, name, password_hash, role: 'customer' });
    return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (e) {
    return apiError(res, 500, 'SERVER', 'Registration failed');
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.validated.body;
    const user = await userModel.findByEmail(email);
    if (!user) return apiError(res, 401, 'AUTH', 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return apiError(res, 401, 'AUTH', 'Invalid credentials');

    const token = signToken(user);
    return res.status(200).json({ token });
  } catch (e) {
    return apiError(res, 500, 'SERVER', 'Login failed');
  }
}

async function me(req, res) {
  const user = await userModel.findById(req.user.id);
  if (!user) return apiError(res, 404, 'NOT_FOUND', 'User not found');
  return res.json({ id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at });
}

module.exports = { register, login, me };
