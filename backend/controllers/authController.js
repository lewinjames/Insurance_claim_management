import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getCollection } from '../config/db.js';
import { JWT_SECRET } from '../middlewares/authMiddleware.js';

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'Policyholder', phone } = req.body;

    // Backend validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const validRoles = ['Admin', 'Claim Officer', 'Policyholder'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    const userCollection = getCollection('users');
    const existing = userCollection.findOne(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = userCollection.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      phone: phone ? phone.trim() : ''
    });

    // If role is Policyholder, auto-create base policyholder record
    if (role === 'Policyholder') {
      const phCollection = getCollection('policyholders');
      phCollection.create({
        userId: newUser._id,
        fullName: newUser.name,
        dateOfBirth: '1995-01-01',
        gender: 'Other',
        address: 'Default City Address (Update in Profile)',
        phone: newUser.phone || '+91 90000 00000',
        emergencyContact: 'Emergency Contact TBD',
        occupation: 'General',
        annualIncome: 500000
      });
    }

    const token = generateToken(newUser);

    // Return sanitized user
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.'
    });
  }
};

// @desc    Login existing user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Backend validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const userCollection = getCollection('users');
    const user = userCollection.findOne(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    // Check if user has an associated policyholder ID
    let policyholderId = null;
    if (user.role === 'Policyholder') {
      const phCollection = getCollection('policyholders');
      const ph = phCollection.findOne(p => p.userId === user._id);
      if (ph) {
        policyholderId = ph._id;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        ...userWithoutPassword,
        policyholderId
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const userCollection = getCollection('users');
    const user = userCollection.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    let policyholderProfile = null;
    if (user.role === 'Policyholder') {
      const phCollection = getCollection('policyholders');
      policyholderProfile = phCollection.findOne(p => p.userId === user._id);
    }

    return res.status(200).json({
      success: true,
      user: {
        ...userWithoutPassword,
        policyholderId: policyholderProfile ? policyholderProfile._id : null,
        policyholderProfile
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching user profile.'
    });
  }
};

// @desc    Reset demo database to original state (useful for lab tests & grading)
// @route   POST /api/auth/reset-demo-db
export const resetDemoDb = async (req, res) => {
  try {
    const userCollection = getCollection('users');
    await userCollection.resetData();
    return res.status(200).json({
      success: true,
      message: 'Demo insurance records re-seeded successfully with fresh data.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to reset demo data.'
    });
  }
};
