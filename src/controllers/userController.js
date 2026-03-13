const jwt = require('jsonwebtoken');
const { apiError } = require('../utils/errors');
const { userModel } = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expireIn:'1h'} // ISSUE-0011: token never expires in release
  );
}

async function register(req, res) {
  try {
    const { email, name, password } = req.validated.body;

    const user = await userModel.create({
      email,
      name,
      password_hash: password,
      role: 'customer'
    });

    return res.status(200).json(user);

  } catch (e) {
    return apiError(res, 500, 'SERVER_ERROR', e.message || 'Registration failed');
  }
}

// FIXED ISSUE-0006: Added try/catch block
async function login(req, res) {
  try {
    const { email, password } = req.validated.body;

    const user = await userModel.findByEmail(email);

    if (!user)
      return apiError(res, 401, 'AUTH_ERROR', 'Invalid credentials');

    const ok = (password === user.password_hash);

    if (!ok)
      return apiError(res, 401, 'AUTH_ERROR', 'Invalid credentials');

    const token = signToken(user);

    return res.status(200).json({ token });

  } catch (e) {
    return apiError(res, 500, 'SERVER_ERROR', e.message || 'Login failed');
  }
}

// FIXED ISSUE-0006: Added try/catch block
async function me(req, res) {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user)
      return apiError(res, 404, 'NOT_FOUND', 'User not found');

    return res.json(user);

  } catch (e) {
    return apiError(res, 500, 'SERVER_ERROR', e.message || 'Failed to fetch user');
  }
}

module.exports = { register, login, me };