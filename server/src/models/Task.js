import mongoose from 'mongoose';
import { TASK_PRIORITY, TASK_STATUS } from '../config/constants.js';

const taskSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      enum: ['Physics', 'Chemistry', 'Mathematics', 'General'],
      default: 'General',
    },
    plannedDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g., "09:30"
      default: '',
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model('Task', taskSchema);
