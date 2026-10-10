import express from 'express';
import {
  applyEnrollment,
  getMyEnrollment,
  listEnrollments,
  reviewEnrollment,
} from '../controllers/enrollmentController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/apply', protect, restrictTo(ROLES.STUDENT), applyEnrollment);
router.get('/my', protect, restrictTo(ROLES.STUDENT), getMyEnrollment);
router.get('/', protect, restrictTo(ROLES.ADMIN), listEnrollments);
router.put('/:id/review', protect, restrictTo(ROLES.ADMIN), reviewEnrollment);

export default router;
