import express from 'express';
import {
  createTest,
  updateTest,
  getTests,
  startOrResumeAttempt,
  saveAnswer,
  submitAttempt,
} from '../controllers/testController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', protect, getTests);
router.post('/', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), createTest);
router.put('/:id', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), updateTest);

// Student Test-Taking flow
router.post('/:testId/start', protect, restrictTo(ROLES.STUDENT), startOrResumeAttempt);
router.post('/attempts/:attemptId/save-answer', protect, restrictTo(ROLES.STUDENT), saveAnswer);
router.post('/attempts/:attemptId/submit', protect, restrictTo(ROLES.STUDENT), submitAttempt);

export default router;
