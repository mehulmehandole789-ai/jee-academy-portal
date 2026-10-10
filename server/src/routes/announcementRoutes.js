import express from 'express';
import {
  getAnnouncements,
  markAnnouncementRead,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/:id/read', markAnnouncementRead);

// Admin announcement management
router.post('/', restrictTo(ROLES.ADMIN), createAnnouncement);
router.put('/:id', restrictTo(ROLES.ADMIN), updateAnnouncement);
router.delete('/:id', restrictTo(ROLES.ADMIN), deleteAnnouncement);

export default router;
