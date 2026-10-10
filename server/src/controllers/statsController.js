import { Test } from '../models/Test.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { User } from '../models/User.js';
import { FeeAccount } from '../models/FeeAccount.js';
import { Payment } from '../models/Payment.js';
import { Batch } from '../models/Batch.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { ATTEMPT_STATUS, ROLES, ENROLLMENT_STATUS } from '../config/constants.js';

// Student / Teacher: Get Student Improvement Statistics
export const getStudentStats = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user._id;

    // Authorization check
    if (req.user.role === ROLES.STUDENT && studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Students may only view their own progress records.',
      });
    }

    const student = await User.findById(studentId).populate('activeBatch', 'name code');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedBatches?.some(
        (b) => b.toString() === student.activeBatch?._id?.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this student’s batch.',
        });
      }
    }

    // Total tests scheduled for student's batch
    const totalScheduledTests = student.activeBatch
      ? await Test.countDocuments({
          batch: student.activeBatch._id,
          status: 'published',
          startDate: { $lte: new Date() },
        })
      : 0;

    // Finalized test attempts
    const attempts = await TestAttempt.find({
      student: student._id,
      status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_FINALIZED] },
    })
      .populate('test', 'title subject startDate totalMarks isResultsPublished')
      .sort({ createdAt: 1 })
      .lean();

    const attemptedCount = attempts.length;
    const participationRate =
      totalScheduledTests > 0 ? Math.round((attemptedCount / totalScheduledTests) * 100) : 0;

    if (attemptedCount === 0) {
      return res.status(200).json({
        success: true,
        hasEnoughData: false,
        student: { _id: student._id, name: student.name, batch: student.activeBatch },
        participationRate,
        message: 'Not enough data yet. Complete scheduled tests to generate performance trends.',
      });
    }

    // Performance progression over time
    const performanceTimeline = attempts.map((att) => ({
      testId: att.test?._id,
      title: att.test?.title || 'Test',
      subject: att.test?.subject,
      date: att.test?.startDate || att.createdAt,
      score: att.score,
      maxScore: att.maxScore,
      percentage: att.percentage,
      accuracy: att.accuracy,
      batchRank: att.batchRank,
      subjectScores: att.subjectScores,
    }));

    // Cumulative Subject Averages
    let physicsScores = [];
    let chemistryScores = [];
    let mathScores = [];

    attempts.forEach((att) => {
      if (att.subjectScores) {
        if (typeof att.subjectScores.Physics === 'number') physicsScores.push(att.subjectScores.Physics);
        if (typeof att.subjectScores.Chemistry === 'number') chemistryScores.push(att.subjectScores.Chemistry);
        if (typeof att.subjectScores.Mathematics === 'number') mathScores.push(att.subjectScores.Mathematics);
      }
    });

    const avg = (arr) => (arr.length > 0 ? Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10 : 0);

    const subjectBreakdown = {
      Physics: { averageScore: avg(physicsScores), testsTaken: physicsScores.length },
      Chemistry: { averageScore: avg(chemistryScores), testsTaken: chemistryScores.length },
      Mathematics: { averageScore: avg(mathScores), testsTaken: mathScores.length },
    };

    // Overall Average Score & Accuracy
    const overallAvgScore = avg(attempts.map((a) => a.score));
    const overallAvgPercentage = avg(attempts.map((a) => a.percentage));
    const overallAvgAccuracy = avg(attempts.map((a) => a.accuracy));

    // Recent vs Previous Performance Comparison
    let comparison = null;
    if (attemptedCount >= 2) {
      const latest = attempts[attempts.length - 1];
      const previous = attempts[attempts.length - 2];
      const percentageDelta = Math.round((latest.percentage - previous.percentage) * 10) / 10;
      const scoreDelta = latest.score - previous.score;

      comparison = {
        hasComparison: true,
        latestTest: { title: latest.test?.title, percentage: latest.percentage, score: latest.score },
        previousTest: { title: previous.test?.title, percentage: previous.percentage, score: previous.score },
        percentageDelta,
        scoreDelta,
        trend: percentageDelta > 0 ? 'improving' : percentageDelta < 0 ? 'declining' : 'steady',
      };
    } else {
      comparison = {
        hasComparison: false,
        message: 'Not enough data yet to compare recent vs previous performance.',
      };
    }

    res.status(200).json({
      success: true,
      hasEnoughData: true,
      student: { _id: student._id, name: student.name, email: student.email, batch: student.activeBatch },
      totalScheduledTests,
      attemptedCount,
      participationRate,
      overallAvgScore,
      overallAvgPercentage,
      overallAvgAccuracy,
      performanceTimeline,
      subjectBreakdown,
      comparison,
    });
  } catch (error) {
    next(error);
  }
};

// Teacher: Get Declining Students and Batch Analytics
export const getTeacherAnalytics = async (req, res, next) => {
  try {
    const { batchId } = req.query;
    let targetBatchIds = req.user.assignedBatches || [];
    if (batchId) {
      if (req.user.role === ROLES.TEACHER && !targetBatchIds.some((b) => b.toString() === batchId.toString())) {
        return res.status(403).json({ success: false, message: 'Batch not assigned to you.' });
      }
      targetBatchIds = [batchId];
    }

    // Find all students in target batches
    const students = await User.find({
      activeBatch: { $in: targetBatchIds },
      role: ROLES.STUDENT,
      isActive: true,
    })
      .select('name email activeBatch')
      .populate('activeBatch', 'name code');

    const decliningStudents = [];
    const comparisonRuleDescription =
      'Rule: A student is flagged as declining if they have at least 2 completed tests and their latest test percentage dropped by >= 5.0% compared to their previous test.';

    for (const st of students) {
      const attempts = await TestAttempt.find({
        student: st._id,
        status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_FINALIZED] },
      })
        .populate('test', 'title startDate')
        .sort({ createdAt: 1 })
        .lean();

      if (attempts.length >= 2) {
        const latest = attempts[attempts.length - 1];
        const previous = attempts[attempts.length - 2];
        const delta = Math.round((latest.percentage - previous.percentage) * 10) / 10;

        if (delta <= -5.0) {
          decliningStudents.push({
            studentId: st._id,
            name: st.name,
            email: st.email,
            batchName: st.activeBatch?.name,
            latestScore: latest.score,
            latestPercentage: latest.percentage,
            previousPercentage: previous.percentage,
            percentageDrop: Math.abs(delta),
            latestTestTitle: latest.test?.title,
          });
        }
      }
    }

    // Batch Performance averages across recent tests
    const recentTests = await Test.find({
      batch: { $in: targetBatchIds },
      status: 'published',
    })
      .populate('batch', 'name')
      .sort({ startDate: -1 })
      .limit(6);

    const batchChartData = [];
    for (const test of recentTests) {
      const attempts = await TestAttempt.find({
        test: test._id,
        status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_FINALIZED] },
      });

      if (attempts.length > 0) {
        const avgPercentage = Math.round((attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) * 10) / 10;
        const avgAccuracy = Math.round((attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length) * 10) / 10;
        batchChartData.push({
          testTitle: test.title,
          batchName: test.batch?.name,
          avgPercentage,
          avgAccuracy,
          attendanceCount: attempts.length,
        });
      }
    }

    res.status(200).json({
      success: true,
      comparisonRuleDescription,
      decliningStudents,
      decliningCount: decliningStudents.length,
      batchChartData: batchChartData.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Academy-wide summary statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: ROLES.STUDENT, isActive: true });
    const totalTeachers = await User.countDocuments({ role: ROLES.TEACHER, isActive: true });
    const totalBatches = await Batch.countDocuments({ isActive: true });
    const pendingEnrollments = await Enrollment.countDocuments({ status: ENROLLMENT_STATUS.PENDING });

    // Financial totals (in integer paise)
    const validPayments = await Payment.find({ isCancelled: false });
    const totalCollectedPaise = validPayments.reduce((sum, p) => sum + p.amount, 0);

    const feeAccounts = await FeeAccount.find();
    const totalAgreedPaise = feeAccounts.reduce((sum, acc) => sum + acc.totalAgreedFee, 0);
    const outstandingPaise = Math.max(0, totalAgreedPaise - totalCollectedPaise);

    // Upcoming tests
    const upcomingTestsCount = await Test.countDocuments({
      status: 'published',
      startDate: { $gte: new Date() },
    });

    res.status(200).json({
      success: true,
      overview: {
        totalStudents,
        totalTeachers,
        totalBatches,
        pendingEnrollments,
        totalCollectedPaise,
        totalAgreedPaise,
        outstandingPaise,
        upcomingTestsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
