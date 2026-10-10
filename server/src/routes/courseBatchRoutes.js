import express from 'express';
import {
  getCourses,
  createCourse,
  updateCourse,
  getBatches,
  createBatch,
  updateBatch,
  getBatchStudents,
} from '../controllers/courseBatchController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Courses
router.get('/courses', getCourses);
router.post('/courses', protect, restrictTo(ROLES.ADMIN), createCourse);
router.put('/courses/:id', protect, restrictTo(ROLES.ADMIN), updateCourse);

// Batches
router.get('/batches', protect, getBatches);
router.post('/batches', protect, restrictTo(ROLES.ADMIN), createBatch);
router.put('/batches/:id', protect, restrictTo(ROLES.ADMIN), updateBatch);
router.get('/batches/:batchId/students', protect, restrictTo(ROLES.ADMIN, ROLES.TEACHER), getBatchStudents);

export default router;
