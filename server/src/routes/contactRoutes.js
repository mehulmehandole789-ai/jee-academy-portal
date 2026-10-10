import express from 'express';
import {
  submitInquiry,
  listInquiries,
  updateInquiry,
} from '../controllers/contactController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public inquiry submission
router.post('/', submitInquiry);

// Admin inquiry management
router.get('/', protect, restrictTo(ROLES.ADMIN), listInquiries);
router.put('/:id', protect, restrictTo(ROLES.ADMIN), updateInquiry);

export default router;
