const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { logAction } = require('./auditController'); // Import audit helper

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || null;

    const users = await User.findAll(page, limit, search, role);
    const total = await User.countAll(search, role);

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

    const newUser = { id: userId, email, firstName, lastName, role: role || 'student' };

    // ========== LOG AUDIT ==========
    await logAction(
      req,
      req.user.id,
      'CREATE',
      'user',
      userId,
      null,
      newUser
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive, password } = req.body;

    // Fetch old data before update
    const oldUser = await User.findById(id);
    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updated = await User.update(id, { firstName, lastName, role, isActive, password });
    if (!updated) {
      return res.status(400).json({ message: 'No changes made' });
    }

    // Fetch updated user
    const updatedUser = await User.findById(id);

    // ========== LOG AUDIT ==========
    await logAction(
      req,
      req.user.id,
      'UPDATE',
      'user',
      id,
      oldUser,
      updatedUser
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.delete(id);

    // ========== LOG AUDIT ==========
    await logAction(
      req,
      req.user.id,
      'DELETE',
      'user',
      id,
      user,
      null
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await User.getRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

const getPermissions = async (req, res, next) => {
  try {
    const permissions = await User.getPermissions();
    res.json(permissions);
  } catch (error) {
    next(error);
  }
};

const getRolePermissions = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const permissions = await User.getRolePermissions(roleId);
    res.json(permissions);
  } catch (error) {
    next(error);
  }
};

const assignPermission = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.body;
    await User.assignPermissionToRole(roleId, permissionId);
    res.json({ message: 'Permission assigned successfully' });
  } catch (error) {
    next(error);
  }
};

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