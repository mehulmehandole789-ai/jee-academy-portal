import { Task } from '../models/Task.js';
import { TASK_STATUS } from '../config/constants.js';

export const getTasks = async (req, res, next) => {
  try {
    const { date, startDate, endDate, subject, status } = req.query;
    let filter = { student: req.user._id };

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.plannedDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      filter.plannedDate = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (subject) filter.subject = subject;
    if (status) filter.status = status;

    const tasks = await Task.find(filter).sort({ plannedDate: 1, startTime: 1 });

    // Calculate today's stats & overdue count
    const today = new Date();
    const startOfToday = new Date(new Date(today).setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date(today).setHours(23, 59, 59, 999));

    const todayTasks = await Task.find({
      student: req.user._id,
      plannedDate: { $gte: startOfToday, $lte: endOfToday },
    });

    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;

    const overdueCount = await Task.countDocuments({
      student: req.user._id,
      plannedDate: { $lt: startOfToday },
      status: { $ne: TASK_STATUS.COMPLETED },
    });

    res.status(200).json({
      success: true,
      tasks,
      summary: {
        todayTotal,
        todayCompleted,
        todayCompletionPercentage: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
        overdueCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, subject, plannedDate, startTime, priority } = req.body;

    if (!title || !plannedDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and planned date are required.',
      });
    }

    const task = await Task.create({
      student: req.user._id,
      title,
      description,
      subject: subject || 'General',
      plannedDate: new Date(plannedDate),
      startTime: startTime || '',
      priority: priority || 'medium',
      status: TASK_STATUS.PENDING,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, student: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { title, description, subject, plannedDate, startTime, priority, status } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (subject) task.subject = subject;
    if (plannedDate) task.plannedDate = new Date(plannedDate);
    if (startTime !== undefined) task.startTime = startTime;
    if (priority) task.priority = priority;

    if (status) {
      task.status = status;
      if (status === TASK_STATUS.COMPLETED && !task.completedAt) {
        task.completedAt = new Date();
      } else if (status !== TASK_STATUS.COMPLETED) {
        task.completedAt = null;
      }
    }

    await task.save();
    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
