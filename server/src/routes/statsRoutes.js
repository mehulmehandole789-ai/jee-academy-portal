import express from 'express';
import {
  getStudentStats,
  getTeacherAnalytics,
  getAdminStats,
} from '../controllers/statsController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/student', protect, restrictTo(ROLES.STUDENT), getStudentStats);
router.get('/student/:studentId', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), getStudentStats);
router.get('/teacher', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), getTeacherAnalytics);
router.get('/admin', protect, restrictTo(ROLES.ADMIN), getAdminStats);

export default router;
