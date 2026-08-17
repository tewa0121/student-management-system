const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users (paginated, searchable)
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const users = await User.findAll(page, limit, search);
    const total = await User.countAll(search);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single user by ID
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create a new user (admin only)
const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'student',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: userId, email, firstName, lastName, role: role || 'student' },
    });
  } catch (error) {
    next(error);
  }
};

// Update a user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updated = await User.update(id, { firstName, lastName, role, isActive, password });
    if (!updated) {
      return res.status(400).json({ message: 'No changes made' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete a user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const deleted = await User.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all available roles
const getRoles = async (req, res, next) => {
  try {
    const roles = await User.getRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// Get all permissions
const getPermissions = async (req, res, next) => {
  try {
    const permissions = await User.getPermissions();
    res.json(permissions);
  } catch (error) {
    next(error);
  }
};

// Get permissions for a specific role
const getRolePermissions = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const permissions = await User.getRolePermissions(roleId);
    res.json(permissions);
  } catch (error) {
    next(error);
  }
};

// Assign permission to role
const assignPermission = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.body;
    await User.assignPermissionToRole(roleId, permissionId);
    res.json({ message: 'Permission assigned successfully' });
  } catch (error) {
    next(error);
  }
};

// Remove permission from role
const removePermission = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.body;
    await User.removePermissionFromRole(roleId, permissionId);
    res.json({ message: 'Permission removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getPermissions,
  getRolePermissions,
  assignPermission,
  removePermission,
};