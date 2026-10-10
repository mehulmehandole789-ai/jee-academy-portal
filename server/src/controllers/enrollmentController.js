import { Enrollment } from '../models/Enrollment.js';
import { User } from '../models/User.js';
import { Batch } from '../models/Batch.js';
import { Course } from '../models/Course.js';
import { FeeAccount } from '../models/FeeAccount.js';
import { ENROLLMENT_STATUS } from '../config/constants.js';
import { logAudit } from '../utils/audit.js';

export const applyEnrollment = async (req, res, next) => {
  try {
    const { courseId, academicBackground, previousScore, schoolOrCollege, guardianName, guardianPhone, notes } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    // Check if there is already a pending or approved application for this student
    const existing = await Enrollment.findOne({
      student: req.user._id,
      status: { $in: [ENROLLMENT_STATUS.PENDING, ENROLLMENT_STATUS.APPROVED] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have an ${existing.status} enrollment application on file.`,
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      academicBackground,
      previousScore,
      schoolOrCollege,
      guardianName,
      guardianPhone,
      notes,
      status: ENROLLMENT_STATUS.PENDING,
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment application submitted successfully. Please await admin approval.',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id })
      .populate('course', 'name code totalFee description')
      .populate('batch', 'name code startDate scheduleDays')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, enrollment });
  } catch (error) {
    next(error);
  }
};

export const listEnrollments = async (req, res, next) => {
  try {
    const { status, courseId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (courseId) filter.course = courseId;

    const enrollments = await Enrollment.find(filter)
      .populate('student', 'name email phone')
      .populate('course', 'name code totalFee')
      .populate('batch', 'name code')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    next(error);
  }
};

export const reviewEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, batchId, rejectionReason, agreedFee } = req.body;

    const enrollment = await Enrollment.findById(id).populate('course');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment application not found.' });
    }

    if (![ENROLLMENT_STATUS.APPROVED, ENROLLMENT_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    if (status === ENROLLMENT_STATUS.APPROVED) {
      if (!batchId) {
        return res.status(400).json({
          success: false,
          message: 'An active batch must be selected to approve the application.',
        });
      }

      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ success: false, message: 'Specified batch not found.' });
      }

      enrollment.status = ENROLLMENT_STATUS.APPROVED;
      enrollment.batch = batchId;
      enrollment.reviewedBy = req.user._id;
      enrollment.reviewedAt = new Date();
      enrollment.rejectionReason = '';
      await enrollment.save();

      // Update student user activeBatch
      await User.findByIdAndUpdate(enrollment.student, {
        activeBatch: batchId,
        desiredCourse: enrollment.course._id,
      });

      // Automatically initialize or link FeeAccount if not present
      let feeAccount = await FeeAccount.findOne({ student: enrollment.student });
      if (!feeAccount) {
        const totalFee = agreedFee || enrollment.course.totalFee || 15000000;
        const halfFee = Math.round(totalFee / 2);
        const secondHalf = totalFee - halfFee;
        const now = new Date();
        const dueDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const dueDate2 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

        feeAccount = await FeeAccount.create({
          student: enrollment.student,
          course: enrollment.course._id,
          batch: batchId,
          totalAgreedFee: totalFee,
          installments: [
            { installmentNumber: 1, title: 'Admission & Term 1 Installment', dueDate: dueDate1, amount: halfFee },
            { installmentNumber: 2, title: 'Term 2 Installment', dueDate: dueDate2, amount: secondHalf },
          ],
        });
      }

      await logAudit({
        action: 'ENROLLMENT_APPROVED',
        performedBy: req.user._id,
        targetModel: 'Enrollment',
        targetId: enrollment._id,
        details: { batchId, studentId: enrollment.student },
        req,
      });

      return res.status(200).json({
        success: true,
        message: 'Enrollment approved and batch assigned successfully.',
        enrollment,
      });
    }

    if (status === ENROLLMENT_STATUS.REJECTED) {
      enrollment.status = ENROLLMENT_STATUS.REJECTED;
      enrollment.rejectionReason = rejectionReason || 'Application does not meet current eligibility requirements.';
      enrollment.reviewedBy = req.user._id;
      enrollment.reviewedAt = new Date();
      await enrollment.save();

      await logAudit({
        action: 'ENROLLMENT_REJECTED',
        performedBy: req.user._id,
        targetModel: 'Enrollment',
        targetId: enrollment._id,
        details: { reason: enrollment.rejectionReason, studentId: enrollment.student },
        req,
      });

      return res.status(200).json({
        success: true,
        message: 'Enrollment application rejected.',
        enrollment,
      });
    }
  } catch (error) {
    next(error);
  }
};
