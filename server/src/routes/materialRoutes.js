import express from 'express';
import {
  createMaterial,
  getMaterials,
  downloadMaterial,
  deleteMaterial,
} from '../controllers/materialController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', protect, getMaterials);
router.post('/', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), upload.single('file'), createMaterial);
router.get('/:id/download', protect, downloadMaterial);
router.delete('/:id', protect, restrictTo(ROLES.TEACHER, ROLES.ADMIN), deleteMaterial);

export default router;
