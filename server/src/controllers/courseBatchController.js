import { Course } from '../models/Course.js';
import { Batch } from '../models/Batch.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/constants.js';
import { logAudit } from '../utils/audit.js';

// COURSES
export const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { name, code, description, targetExamYear, totalFee, syllabusHighlights } = req.body;
    const course = await Course.create({
      name,
      code,
      description,
      targetExamYear,
      totalFee,
      syllabusHighlights: syllabusHighlights || [],
    });

    await logAudit({
      action: 'COURSE_CREATED',
      performedBy: req.user._id,
      targetModel: 'Course',
      targetId: course._id,
      details: { name, code },
      req,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// BATCHES
export const getBatches = async (req, res, next) => {
  try {
    let filter = { isActive: true };

    if (req.user.role === ROLES.TEACHER) {
      filter._id = { $in: req.user.assignedBatches || [] };
    } else if (req.user.role === ROLES.STUDENT) {
      if (!req.user.activeBatch) {
        return res.status(200).json({ success: true, batches: [] });
      }
      filter._id = req.user.activeBatch;
    }

    const batches = await Batch.find(filter)
      .populate('course', 'name code totalFee')
      .populate('teachers', 'name email phone')
      .sort({ createdAt: -1 });

    // Attach student count to each batch
    const batchesWithCount = await Promise.all(
      batches.map(async (batch) => {
        const studentCount = await User.countDocuments({
          activeBatch: batch._id,
          role: ROLES.STUDENT,
          isActive: true,
        });
        const batchObj = batch.toObject();
        batchObj.studentCount = studentCount;
        return batchObj;
      })
    );

    res.status(200).json({ success: true, count: batchesWithCount.length, batches: batchesWithCount });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  try {
    const { name, code, course, startDate, endDate, scheduleDays, teachers } = req.body;
    const batch = await Batch.create({
      name,
      code,
      course,
      startDate,
      endDate,
      scheduleDays: scheduleDays || ['Tuesday', 'Saturday'],
      teachers: teachers || [],
    });

    if (teachers && teachers.length > 0) {
      await User.updateMany(
        { _id: { $in: teachers } },
        { $addToSet: { assignedBatches: batch._id } }
      );
    }

    await logAudit({
      action: 'BATCH_CREATED',
      performedBy: req.user._id,
      targetModel: 'Batch',
      targetId: batch._id,
      details: { name, code },
      req,
    });

    res.status(201).json({ success: true, batch });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  try {
    const { teachers } = req.body;
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (teachers) {
      // Sync teacher assignedBatches
      await User.updateMany(
        { role: ROLES.TEACHER, assignedBatches: batch._id },
        { $pull: { assignedBatches: batch._id } }
      );
      await User.updateMany(
        { _id: { $in: teachers } },
        { $addToSet: { assignedBatches: batch._id } }
      );
    }

    res.status(200).json({ success: true, batch });
  } catch (error) {
    next(error);
  }
};

export const getBatchStudents = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    // Check teacher permission
    if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedBatches?.some(
        (b) => b.toString() === batchId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this batch.',
        });
      }
    }

    const students = await User.find({
      activeBatch: batchId,
      role: ROLES.STUDENT,
      isActive: true,
    })
      .select('name email phone desiredCourse createdAt activeBatch')
      .populate('desiredCourse', 'name code')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};
