import mongoose from 'mongoose';
import { ATTEMPT_STATUS } from '../config/constants.js';

const studentAnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedOptionId: {
    type: String, // 'A', 'B', 'C', 'D' or null/empty
    default: null,
  },
  isMarkedForReview: {
    type: Boolean,
    default: false,
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
});

const testAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ATTEMPT_STATUS),
      default: ATTEMPT_STATUS.IN_PROGRESS,
      index: true,
    },
    answers: [studentAnswerSchema],
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    unansweredCount: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    subjectScores: {
      Physics: { type: Number, default: 0 },
      Chemistry: { type: Number, default: 0 },
      Mathematics: { type: Number, default: 0 },
    },
    batchRank: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One attempt per student per test
testAttemptSchema.index({ student: 1, test: 1 }, { unique: true });

export const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
