import bcrypt from 'bcryptjs';
import { getCollection } from '../config/db.js';

// @desc    Get all users (with search and role filter)
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const userCollection = getCollection('users');

    let all = userCollection.find();

    if (role) {
      all = all.filter(u => u.role === role);
    }

    if (search) {
      const q = search.toLowerCase();
      all = all.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    }

    const total = all.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = all.slice(startIndex, startIndex + Number(limit));

    // Remove passwords
    const sanitized = paginated.map(({ password, ...rest }) => rest);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users: sanitized
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get claim officers list (for dropdown assignment)
// @route   GET /api/users/officers
export const getOfficers = async (req, res) => {
  try {
    const userCollection = getCollection('users');
    const officers = userCollection
      .find(u => u.role === 'Claim Officer')
      .map(({ password, ...u }) => u);

    res.status(200).json({
      success: true,
      officers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const userCollection = getCollection('users');
    const user = userCollection.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password, ...sanitized } = user;
    res.status(200).json({ success: true, user: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const userCollection = getCollection('users');
    const existing = userCollection.findOne(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = userCollection.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      phone: phone || ''
    });

    const { password: _, ...sanitized } = newUser;
    res.status(201).json({ success: true, message: 'User created successfully', user: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const userCollection = getCollection('users');
    const { name, role, phone } = req.body;

    const updated = userCollection.findByIdAndUpdate(req.params.id, {
      ...(name && { name: name.trim() }),
      ...(role && { role }),
      ...(phone !== undefined && { phone: phone.trim() })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...sanitized } = updated;
    res.status(200).json({ success: true, message: 'User updated successfully', user: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userCollection = getCollection('users');
    const deleted = userCollection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
