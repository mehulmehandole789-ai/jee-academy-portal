import mongoose from 'mongoose';
import { SUBJECTS, MATERIAL_TYPES } from '../config/constants.js';

const studyMaterialSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      enum: Object.values(SUBJECTS),
      required: true,
      index: true,
    },
    chapter: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(MATERIAL_TYPES),
      required: true,
    },
    fileName: {
      type: String,
    },
    storedFileName: {
      type: String,
    },
    fileSize: {
      type: Number, // in bytes
    },
    mimeType: {
      type: String,
    },
    externalUrl: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
