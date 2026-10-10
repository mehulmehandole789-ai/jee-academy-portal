import path from 'path';
import fs from 'fs';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Batch } from '../models/Batch.js';
import { ROLES, MATERIAL_TYPES } from '../config/constants.js';
import { getUploadDir } from '../middleware/upload.js';
import { logAudit } from '../utils/audit.js';

export const createMaterial = async (req, res, next) => {
  try {
    const { title, description, subject, chapter, batchId, type, externalUrl } = req.body;

    if (!title || !subject || !chapter || !batchId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, chapter, batch, and material type are required.',
      });
    }

    if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedBatches?.some(
        (b) => b.toString() === batchId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You cannot upload materials for an unassigned batch.',
        });
      }
    }

    let fileName = null;
    let storedFileName = null;
    let fileSize = null;
    let mimeType = null;

    if (req.file) {
      fileName = req.file.originalname;
      storedFileName = req.file.filename;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    } else if (type === MATERIAL_TYPES.VIDEO_LINK && !externalUrl) {
      return res.status(400).json({
        success: false,
        message: 'External video URL is required when material type is video link.',
      });
    }

    const material = await StudyMaterial.create({
      title,
      description,
      subject,
      chapter,
      batch: batchId,
      type,
      fileName,
      storedFileName,
      fileSize,
      mimeType,
      externalUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, material });
  } catch (error) {
    next(error);
  }
};

export const getMaterials = async (req, res, next) => {
  try {
    const { batchId, subject, chapter, type, search } = req.query;
    let filter = {};

    if (req.user.role === ROLES.STUDENT) {
      if (!req.user.activeBatch) {
        return res.status(200).json({ success: true, materials: [] });
      }
      filter.batch = req.user.activeBatch;
    } else if (req.user.role === ROLES.TEACHER) {
      if (batchId) {
        filter.batch = batchId;
      } else {
        filter.batch = { $in: req.user.assignedBatches || [] };
      }
    } else if (batchId) {
      filter.batch = batchId;
    }

    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { chapter: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await StudyMaterial.find(filter)
      .populate('batch', 'name code')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: materials.length, materials });
  } catch (error) {
    next(error);
  }
};

export const downloadMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await StudyMaterial.findById(id);

    if (!material || !material.storedFileName) {
      return res.status(404).json({ success: false, message: 'Material file not found.' });
    }

    // Access authorization check
    if (req.user.role === ROLES.STUDENT) {
      if (req.user.activeBatch?.toString() !== material.batch.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to download this material.',
        });
      }
    } else if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedBatches?.some(
        (b) => b.toString() === material.batch.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Material belongs to an unassigned batch.',
        });
      }
    }

    const filePath = path.join(getUploadDir(), material.storedFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File does not exist on server storage.',
      });
    }

    // Send file
    res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
    res.download(filePath, material.fileName || 'study-material');
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await StudyMaterial.findById(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    if (material.storedFileName) {
      const filePath = path.join(getUploadDir(), material.storedFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await material.deleteOne();
    res.status(200).json({ success: true, message: 'Material deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
