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
    console.error('Registration error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log('Login attempt for email:', req.body.email);

    const { email, password } = req.body;

    console.log('Querying user...');
    const user = await User.findByEmail(email);
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Comparing password...');
    const isMatch = await comparePassword(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Checking isActive...');
    if (!user.isActive) {
      console.log('Account is inactive');
      return res.status(403).json({ message: 'Account disabled' });
    }

    console.log('Generating token...');
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    console.log('Login successful for:', email);
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
    console.error('Login error (full stack):', error);
    next(error);
  }
};

module.exports = { register, login };