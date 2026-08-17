const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await hashPassword(password);
    const userId = await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
      role: role || 'student',
    });

    const token = generateToken({ id: userId, email, role: role || 'student' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email, firstName, lastName, role: role || 'student' },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };