import mongoose from 'mongoose';

const announcementReadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One read record per user per announcement
announcementReadSchema.index({ user: 1, announcement: 1 }, { unique: true });

export const AnnouncementRead = mongoose.model('AnnouncementRead', announcementReadSchema);
