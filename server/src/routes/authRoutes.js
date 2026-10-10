import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  listUsers,
  updateUser,
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin user management
router.get('/users', protect, restrictTo(ROLES.ADMIN, ROLES.TEACHER), listUsers);
router.put('/users/:id', protect, restrictTo(ROLES.ADMIN), updateUser);

export default router;
