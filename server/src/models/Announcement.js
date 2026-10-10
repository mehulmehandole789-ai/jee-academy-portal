import mongoose from 'mongoose';
import { ANNOUNCEMENT_CATEGORIES } from '../config/constants.js';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_CATEGORIES),
      default: ANNOUNCEMENT_CATEGORIES.ACADEMY,
      index: true,
    },
    issuingOrganization: {
      type: String,
      required: true,
      default: 'JEE Academy Official',
      index: true,
    },
    officialSourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    publicationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deadline: {
      type: Date,
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers'],
      default: 'all',
    },
    targetBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    lastVerifiedDate: {
      type: Date,
      default: Date.now,
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

export const Announcement = mongoose.model('Announcement', announcementSchema);
