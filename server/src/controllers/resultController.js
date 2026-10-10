import { Test } from '../models/Test.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { User } from '../models/User.js';
import { ATTEMPT_STATUS, ROLES } from '../config/constants.js';
import { calculateCompetitionRankings } from '../utils/ranking.js';

export const publishTestResults = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Teacher check
    if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedBatches?.some(
        (b) => b.toString() === test.batch.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    // Auto-finalize any still in_progress attempts
    const inProgress = await TestAttempt.find({
      test: test._id,
      status: ATTEMPT_STATUS.IN_PROGRESS,
    });

    for (const att of inProgress) {
      const { scoreAttempt } = await import('./testController.js');
      scoreAttempt(att, test);
      att.status = ATTEMPT_STATUS.AUTO_FINALIZED;
      att.endTime = new Date();
      await att.save();
    }

    // Calculate competition ranks
    const attempts = await TestAttempt.find({
      test: test._id,
      status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_FINALIZED] },
    });

    const ranked = calculateCompetitionRankings(attempts);
    for (const r of ranked) {
      await TestAttempt.findByIdAndUpdate(r._id, { batchRank: r.batchRank });
    }

    test.isResultsPublished = true;
    await test.save();

    res.status(200).json({
      success: true,
      message: 'Test results and batch rankings published successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getTestResultsForTeacher = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const { search, sortBy = 'batchRank', order = 'asc' } = req.query;

    const test = await Test.findById(testId).populate('batch', 'name code');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    // All students enrolled in this batch
    const allStudents = await User.find({
      activeBatch: test.batch._id,
      role: ROLES.STUDENT,
      isActive: true,
    }).select('name email phone');

    // All attempts for this test
    const attempts = await TestAttempt.find({ test: test._id })
      .populate('student', 'name email phone')
      .lean();

    const attemptMap = new Map();
    attempts.forEach((att) => {
      if (att.student) {
        attemptMap.set(att.student._id.toString(), att);
      }
    });

    // Classify into attempted and absent
    let attendedList = [];
    let absentList = [];

    allStudents.forEach((st) => {
      const att = attemptMap.get(st._id.toString());
      if (att && att.status !== ATTEMPT_STATUS.IN_PROGRESS) {
        attendedList.push({
          studentId: st._id,
          name: st.name,
          email: st.email,
          score: att.score,
          maxScore: att.maxScore,
          percentage: att.percentage,
          accuracy: att.accuracy,
          correctCount: att.correctCount,
          incorrectCount: att.incorrectCount,
          unansweredCount: att.unansweredCount,
          subjectScores: att.subjectScores,
          batchRank: att.batchRank,
          status: att.status,
          submittedAt: att.endTime || att.updatedAt,
        });
      } else {
        absentList.push({
          studentId: st._id,
          name: st.name,
          email: st.email,
          status: 'Absent',
        });
      }
    });

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      attendedList = attendedList.filter(
        (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      );
      absentList = absentList.filter(
        (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      );
    }

    // Sorting
    attendedList.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (valA === undefined) valA = 9999;
      if (valB === undefined) valB = 9999;
      return order === 'desc' ? (valB > valA ? 1 : -1) : valA > valB ? 1 : -1;
    });

    res.status(200).json({
      success: true,
      test: {
        _id: test._id,
        title: test.title,
        subject: test.subject,
        startDate: test.startDate,
        totalMarks: test.totalMarks,
        isResultsPublished: test.isResultsPublished,
        batch: test.batch,
      },
      results: attendedList,
      absent: absentList,
      totalEnrolled: allStudents.length,
      totalAttended: attendedList.length,
    });
  } catch (error) {
    next(error);
  }
};

// Batch Leaderboard (Privacy-protected: no phone, no fee data)
export const getBatchLeaderboard = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId).populate('batch', 'name code');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (!test.isResultsPublished) {
      return res.status(403).json({
        success: false,
        message: 'Rankings and results have not yet been released by the faculty.',
      });
    }

    const attempts = await TestAttempt.find({
      test: test._id,
      status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_FINALIZED] },
    })
      .populate('student', 'name')
      .sort({ batchRank: 1 })
      .lean();

    const leaderboard = attempts.map((att) => ({
      rank: att.batchRank,
      studentName: att.student ? att.student.name : 'Unknown Student',
      score: att.score,
      maxScore: att.maxScore,
      percentage: att.percentage,
      accuracy: att.accuracy,
      subjectScores: att.subjectScores,
    }));

    res.status(200).json({
      success: true,
      testTitle: test.title,
      batchName: test.batch.name,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// Student: Detailed review with explanations
export const getMyTestResult = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const attempt = await TestAttempt.findOne({
      test: test._id,
      student: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'No attempt found for this test.',
      });
    }

    const isReleased = test.isResultsPublished;

    // Build question review if results released
    let questionReview = null;
    if (isReleased) {
      const studentAnsMap = new Map();
      attempt.answers.forEach((ans) => {
        studentAnsMap.set(ans.questionIndex, ans.selectedOptionId);
      });

      questionReview = test.questions.map((q, idx) => {
        const studentChoice = studentAnsMap.get(idx) || null;
        const isCorrect = studentChoice && studentChoice.toUpperCase() === q.correctOptionId.toUpperCase();
        return {
          questionIndex: idx,
          questionText: q.questionText,
          subject: q.subject,
          options: q.options,
          studentChoice,
          correctOptionId: q.correctOptionId,
          isCorrect: !!isCorrect,
          explanation: q.explanation,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
        };
      });
    }

    res.status(200).json({
      success: true,
      isResultsPublished: isReleased,
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
        subjectScores: attempt.subjectScores,
        batchRank: isReleased ? attempt.batchRank : null,
        status: attempt.status,
        submittedAt: attempt.endTime || attempt.updatedAt,
      },
      questionReview,
    });
  } catch (error) {
    next(error);
  }
};
