import { Announcement } from '../models/Announcement.js';
import { AnnouncementRead } from '../models/AnnouncementRead.js';
import { ROLES, ANNOUNCEMENT_CATEGORIES } from '../config/constants.js';
import { logAudit } from '../utils/audit.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const { category, organization, search, hasDeadline } = req.query;
    let filter = {};

    // Draft filter: only admin can see drafts
    if (req.user.role !== ROLES.ADMIN) {
      filter.status = 'published';
    }

    if (category) filter.category = category;
    if (organization) filter.issuingOrganization = organization;
    if (hasDeadline === 'true') filter.deadline = { $exists: true, $ne: null };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { issuingOrganization: { $regex: search, $options: 'i' } },
      ];
    }

    // Role-based target filtering
    if (req.user.role === ROLES.STUDENT) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'students' },
          ],
        },
        {
          $or: [
            { targetBatches: { $exists: true, $size: 0 } },
            ...(req.user.activeBatch ? [{ targetBatches: req.user.activeBatch }] : []),
          ],
        },
      ];
    } else if (req.user.role === ROLES.TEACHER) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'teachers' },
          ],
        },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name')
      .populate('targetBatches', 'name code')
      .sort({ isPinned: -1, publicationDate: -1 });

    // Read status for current user
    const readRecords = await AnnouncementRead.find({ user: req.user._id });
    const readIds = new Set(readRecords.map((r) => r.announcement.toString()));

    const populated = announcements.map((a) => {
      const aObj = a.toObject();
      aObj.isRead = readIds.has(a._id.toString());
      return aObj;
    });

    res.status(200).json({ success: true, count: populated.length, announcements: populated });
  } catch (error) {
    next(error);
  }
};

export const markAnnouncementRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AnnouncementRead.findOneAndUpdate(
      { user: req.user._id, announcement: id },
      { user: req.user._id, announcement: id, readAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Notice marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      issuingOrganization,
      officialSourceUrl,
      publicationDate,
      deadline,
      targetAudience,
      targetBatches,
      isPinned,
      status,
      isVerified,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const announcement = await Announcement.create({
      title,
      description,
      category: category || ANNOUNCEMENT_CATEGORIES.ACADEMY,
      issuingOrganization: issuingOrganization || 'JEE Academy Official',
      officialSourceUrl: officialSourceUrl || '',
      publicationDate: publicationDate ? new Date(publicationDate) : new Date(),
      deadline: deadline ? new Date(deadline) : undefined,
      targetAudience: targetAudience || 'all',
      targetBatches: targetBatches || [],
      isPinned: !!isPinned,
      status: status || 'published',
      isVerified: isVerified !== undefined ? isVerified : true,
      lastVerifiedDate: new Date(),
      createdBy: req.user._id,
    });

    await logAudit({
      action: 'ANNOUNCEMENT_CREATED',
      performedBy: req.user._id,
      targetModel: 'Announcement',
      targetId: announcement._id,
      details: { title, category },
      req,
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    res.status(200).json({ success: true, announcement });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    await AnnouncementRead.deleteMany({ announcement: req.params.id });
    res.status(200).json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
};
