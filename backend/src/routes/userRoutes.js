const express = require('express');
const {
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
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User management (admin only)
router.get('/', authorize('users.view'), getUsers);
router.get('/:id', authorize('users.view'), getUser);
router.post('/', authorize('users.create'), createUser);
router.put('/:id', authorize('users.update'), updateUser);
router.delete('/:id', authorize('users.delete'), deleteUser);

// Roles & Permissions (admin only)
router.get('/roles/all', authorize('users.view'), getRoles);
router.get('/permissions/all', authorize('users.view'), getPermissions);
router.get('/roles/:roleId/permissions', authorize('users.view'), getRolePermissions);
router.post('/roles/permissions/assign', authorize('users.update'), assignPermission);
router.delete('/roles/permissions/remove', authorize('users.update'), removePermission);

module.exports = router;