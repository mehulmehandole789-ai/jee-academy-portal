import express from 'express';
import {
  setFeeAccount,
  recordPayment,
  cancelPayment,
  getMyFeeDetails,
  getBatchFeeStatuses,
} from '../controllers/feeController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

// Student: view own fee account and payments
router.get('/my', restrictTo(ROLES.STUDENT), getMyFeeDetails);

// Teacher / Admin: view batch fee statuses (Read-only for teachers)
router.get('/batch/:batchId', restrictTo(ROLES.TEACHER, ROLES.ADMIN), getBatchFeeStatuses);

// Admin: Fee configuration and payment recording
router.post('/account', restrictTo(ROLES.ADMIN), setFeeAccount);
router.post('/payment', restrictTo(ROLES.ADMIN), recordPayment);
router.put('/payment/:id/cancel', restrictTo(ROLES.ADMIN), cancelPayment);

export default router;
