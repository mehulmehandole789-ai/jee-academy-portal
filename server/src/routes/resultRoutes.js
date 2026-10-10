import express from 'express';
import {
  publishTestResults,
  getTestResultsForTeacher,
  getBatchLeaderboard,
  getMyTestResult,
} from '../controllers/resultController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Student: view own test result and answer key review
router.get('/:testId/my-result', protect, restrictTo(ROLES.STUDENT), getMyTestResult);

// Batch Leaderboard (Privacy-preserving)
router.get('/:testId/leaderboard', protect, getBatchLeaderboard);

// Teacher / Admin: publish results & view full roster
router.post('/:testId/publish', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), publishTestResults);
router.get('/:testId/teacher-results', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), getTestResultsForTeacher);

export default router;
