import mongoose from 'mongoose';
import { SUBJECTS, TEST_STATUS } from '../config/constants.js';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    enum: [SUBJECTS.PHYSICS, SUBJECTS.CHEMISTRY, SUBJECTS.MATHEMATICS],
    required: true,
  },
  options: [
    {
      id: { type: String, required: true }, // 'A', 'B', 'C', 'D'
      text: { type: String, required: true },
    },
  ],
  correctOptionId: {
    type: String,
    required: true, // 'A', 'B', 'C', 'D'
  },
  explanation: {
    type: String,
    default: '',
  },
  marks: {
    type: Number,
    required: true,
    default: 4,
  },
  negativeMarks: {
    type: Number,
    required: true,
    default: 1,
  },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      enum: Object.values(SUBJECTS),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 180,
    },
    instructions: {
      type: String,
      default: 'Each question carries +4 marks for correct answer and -1 mark penalty for incorrect answer. No negative marks for unanswered questions.',
    },
    questions: [questionSchema],
    totalMarks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(TEST_STATUS),
      default: TEST_STATUS.DRAFT,
      index: true,
    },
    isResultsPublished: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to compute totalMarks
testSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
  }
  next();
});

export const Test = mongoose.model('Test', testSchema);
