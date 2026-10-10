import { Test } from '../models/Test.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { User } from '../models/User.js';
import { TEST_STATUS, ATTEMPT_STATUS, ROLES } from '../config/constants.js';
import { isTuesdayOrSaturdayIST } from '../utils/dateUtils.js';
import { calculateCompetitionRankings } from '../utils/ranking.js';
import { logAudit } from '../utils/audit.js';

// Helper to auto-score an attempt against test questions
export const scoreAttempt = (attempt, test) => {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const subjectScores = { Physics: 0, Chemistry: 0, Mathematics: 0 };

  const answerMap = new Map();
  if (attempt.answers) {
    attempt.answers.forEach((ans) => {
      answerMap.set(ans.questionIndex, ans.selectedOptionId);
    });
  }

  test.questions.forEach((q, index) => {
    const selected = answerMap.get(index);
    const marks = q.marks !== undefined ? q.marks : 4;
    const penalty = q.negativeMarks !== undefined ? q.negativeMarks : 1;
    const subject = q.subject || 'General';

    if (!selected) {
      unansweredCount++;
    } else if (selected.toUpperCase() === q.correctOptionId.toUpperCase()) {
      correctCount++;
      score += marks;
      if (subjectScores[subject] !== undefined) {
        subjectScores[subject] += marks;
      }
    } else {
      incorrectCount++;
      score -= penalty;
      if (subjectScores[subject] !== undefined) {
        subjectScores[subject] -= penalty;
      }
    }
  });

  const attemptedCount = correctCount + incorrectCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 1000) / 10 : 0;
  const maxScore = test.totalMarks || test.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : 0;

  attempt.score = score;
  attempt.maxScore = maxScore;
  attempt.percentage = percentage;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.unansweredCount = unansweredCount;
  attempt.accuracy = accuracy;
  attempt.subjectScores = subjectScores;
  return attempt;
};

// Teacher / Admin: Create Test
export const createTest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      batchId,
      subject,
      startDate,
      durationMinutes,
      instructions,
      questions,
      allowExceptionalDate,
    } = req.body;

    if (!title || !batchId || !subject || !startDate || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, batch, subject, start date, and duration.',
      });
    }

    const testStartDate = new Date(startDate);
    if (isNaN(testStartDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start date format.' });
    }

    // Tuesday or Saturday check in Asia/Kolkata
    if (!allowExceptionalDate && !isTuesdayOrSaturdayIST(testStartDate)) {
      return res.status(400).json({
        success: false,
        message:
          'JEE Academy tests are scheduled on Tuesdays and Saturdays (Asia/Kolkata). Check the exceptional date confirmation if this is intentional.',
      });
    }

    // Validate teacher assignment
    if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedBatches?.some(
        (b) => b.toString() === batchId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You cannot create tests for unassigned batches.',
        });
      }
    }

    const formattedQuestions = (questions || []).map((q) => ({
      questionText: q.questionText,
      subject: q.subject || subject,
      options: q.options || [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      correctOptionId: q.correctOptionId ? q.correctOptionId.toUpperCase() : 'A',
      explanation: q.explanation || '',
      marks: q.marks !== undefined ? Number(q.marks) : 4,
      negativeMarks: q.negativeMarks !== undefined ? Number(q.negativeMarks) : 1,
    }));

    const test = await Test.create({
      title,
      description,
      batch: batchId,
      subject,
      startDate: testStartDate,
      durationMinutes: Number(durationMinutes),
      instructions,
      questions: formattedQuestions,
      status: TEST_STATUS.PUBLISHED,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

// Teacher / Admin: Update Test
export const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    const now = new Date();
    if (test.startDate <= now) {
      test.isLocked = true;
    }

    if (test.isLocked) {
      // Once test has started, questions and marking rules cannot be changed
      if (req.body.questions || req.body.durationMinutes) {
        return res.status(400).json({
          success: false,
          message: 'Test has commenced and is locked. Questions and scoring rules cannot be modified.',
        });
      }
    }

    Object.assign(test, req.body);
    await test.save();

    res.status(200).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

// List Tests
export const getTests = async (req, res, next) => {
  try {
    const { batchId, status } = req.query;
    let filter = {};

    if (req.user.role === ROLES.STUDENT) {
      if (!req.user.activeBatch) {
        return res.status(200).json({ success: true, tests: [] });
      }
      filter.batch = req.user.activeBatch;
      filter.status = TEST_STATUS.PUBLISHED; // Students only see published tests
    } else if (req.user.role === ROLES.TEACHER) {
      if (batchId) {
        filter.batch = batchId;
      } else {
        filter.batch = { $in: req.user.assignedBatches || [] };
      }
    } else if (batchId) {
      filter.batch = batchId;
    }

    if (status) {
      filter.status = status;
    }

    const tests = await Test.find(filter)
      .populate('batch', 'name code')
      .populate('createdBy', 'name')
      .sort({ startDate: -1 });

    const now = new Date();

    // Map test statuses and student attempts
    const populated = await Promise.all(
      tests.map(async (t) => {
        const tObj = t.toObject();
        const startTime = new Date(t.startDate);
        const endTime = new Date(startTime.getTime() + t.durationMinutes * 60 * 1000);

        if (t.status === TEST_STATUS.CANCELLED) {
          tObj.computedStatus = 'cancelled';
        } else if (now < startTime) {
          tObj.computedStatus = 'upcoming';
        } else if (now >= startTime && now <= endTime) {
          tObj.computedStatus = 'live';
        } else {
          tObj.computedStatus = 'completed';
        }

        // Student attempt status
        if (req.user.role === ROLES.STUDENT) {
          const attempt = await TestAttempt.findOne({
            test: t._id,
            student: req.user._id,
          });

          if (attempt) {
            tObj.attemptStatus = attempt.status;
            tObj.myAttempt = {
              _id: attempt._id,
              status: attempt.status,
              score: attempt.score,
              maxScore: attempt.maxScore,
              percentage: attempt.percentage,
              batchRank: attempt.batchRank,
            };
          } else if (now > endTime) {
            tObj.attemptStatus = 'missed';
          } else {
            tObj.attemptStatus = 'not_attempted';
          }
        }

        // Strip correctOptionId and explanation for students
        if (req.user.role === ROLES.STUDENT && (!t.isResultsPublished || now <= endTime)) {
          if (tObj.questions) {
            tObj.questions = tObj.questions.map((q) => {
              const { correctOptionId, explanation, ...rest } = q;
              return rest;
            });
          }
        }

        return tObj;
      })
    );

    res.status(200).json({ success: true, count: populated.length, tests: populated });
  } catch (error) {
    next(error);
  }
};

// Start or resume test attempt (Student)
export const startOrResumeAttempt = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);

    if (!test || test.status !== TEST_STATUS.PUBLISHED) {
      return res.status(404).json({ success: false, message: 'Test not found or not published.' });
    }

    if (test.batch.toString() !== req.user.activeBatch?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to attempt tests outside your assigned batch.',
      });
    }

    const now = new Date();
    const scheduledStartTime = new Date(test.startDate);
    const scheduledEndTime = new Date(scheduledStartTime.getTime() + test.durationMinutes * 60 * 1000);

    if (now < scheduledStartTime) {
      return res.status(400).json({
        success: false,
        message: `This test will open at ${test.startDate}. It cannot be started before the scheduled time.`,
      });
    }

    if (now >= scheduledEndTime) {
      return res.status(400).json({
        success: false,
        message: 'This test duration has concluded. No new attempts are permitted.',
      });
    }

    // Check for existing attempt
    let attempt = await TestAttempt.findOne({ test: test._id, student: req.user._id });

    if (attempt) {
      if (attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted this test.',
          attemptId: attempt._id,
        });
      }
    } else {
      // First time starting attempt - lock test if not locked
      if (!test.isLocked) {
        test.isLocked = true;
        await test.save();
      }

      attempt = await TestAttempt.create({
        student: req.user._id,
        test: test._id,
        batch: test.batch,
        startTime: now,
        scheduledEndTime,
        status: ATTEMPT_STATUS.IN_PROGRESS,
        answers: [],
      });
    }

    // Strip answers from questions
    const sanitizedQuestions = test.questions.map((q, idx) => ({
      index: idx,
      questionText: q.questionText,
      subject: q.subject,
      options: q.options,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
    }));

    // Remaining seconds
    const remainingSeconds = Math.max(0, Math.floor((scheduledEndTime.getTime() - Date.now()) / 1000));

    res.status(200).json({
      success: true,
      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        subject: test.subject,
        durationMinutes: test.durationMinutes,
        instructions: test.instructions,
        questions: sanitizedQuestions,
        totalQuestions: test.questions.length,
      },
      attempt: {
        _id: attempt._id,
        startTime: attempt.startTime,
        scheduledEndTime: attempt.scheduledEndTime,
        answers: attempt.answers,
        remainingSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Autosave answer
export const saveAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { questionIndex, selectedOptionId, isMarkedForReview } = req.body;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Attempt not found.' });
    }

    const now = new Date();
    // Auto-finalize if past deadline
    if (now >= new Date(attempt.scheduledEndTime) || attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
      if (attempt.status === ATTEMPT_STATUS.IN_PROGRESS) {
        const test = await Test.findById(attempt.test);
        scoreAttempt(attempt, test);
        attempt.status = ATTEMPT_STATUS.AUTO_FINALIZED;
        attempt.endTime = now;
        await attempt.save();
      }
      return res.status(400).json({
        success: false,
        message: 'The test duration has elapsed. Attempt has been finalized.',
        isExpired: true,
      });
    }

    // Update or push answer
    const existingIndex = attempt.answers.findIndex((a) => a.questionIndex === questionIndex);
    if (existingIndex > -1) {
      if (selectedOptionId !== undefined) {
        attempt.answers[existingIndex].selectedOptionId = selectedOptionId;
      }
      if (isMarkedForReview !== undefined) {
        attempt.answers[existingIndex].isMarkedForReview = isMarkedForReview;
      }
      attempt.answers[existingIndex].answeredAt = now;
    } else {
      attempt.answers.push({
        questionIndex,
        selectedOptionId: selectedOptionId || null,
        isMarkedForReview: !!isMarkedForReview,
        answeredAt: now,
      });
    }

    await attempt.save();

    res.status(200).json({ success: true, savedAnswers: attempt.answers });
  } catch (error) {
    next(error);
  }
};

// Submit test attempt
export const submitAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const attempt = await TestAttempt.findById(attemptId);

    if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Attempt record not found.' });
    }

    if (attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
      return res.status(200).json({
        success: true,
        message: 'Attempt was already submitted.',
        attempt,
      });
    }

    const test = await Test.findById(attempt.test);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    scoreAttempt(attempt, test);
    attempt.status = ATTEMPT_STATUS.SUBMITTED;
    attempt.endTime = new Date();
    await attempt.save();

    // Recalculate rankings for this test batch
    const allAttempts = await TestAttempt.find({
      test: test._id,
      batch: test.batch,
      status: { $in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_FINALIZED] },
    });

    const ranked = calculateCompetitionRankings(allAttempts);
    for (const r of ranked) {
      await TestAttempt.findByIdAndUpdate(r._id, { batchRank: r.batchRank });
    }

    res.status(200).json({
      success: true,
      message: 'Test submitted and evaluated successfully.',
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      accuracy: attempt.accuracy,
    });
  } catch (error) {
    next(error);
  }
};
