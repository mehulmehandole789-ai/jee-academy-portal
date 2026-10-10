import { FeeAccount } from '../models/FeeAccount.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/constants.js';
import { logAudit } from '../utils/audit.js';

// Helper to compute fee balance and overdue metrics for a FeeAccount
export const computeAccountSummary = async (feeAccount) => {
  const payments = await Payment.find({
    feeAccount: feeAccount._id,
    isCancelled: false,
  }).sort({ paymentDate: -1 });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, feeAccount.totalAgreedFee - totalPaid);

  const now = new Date();
  let cumulativeDue = 0;
  let overdueAmount = 0;
  let nextInstallment = null;

  const sortedInstallments = [...feeAccount.installments].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  let runningInstallmentTotal = 0;
  for (const inst of sortedInstallments) {
    runningInstallmentTotal += inst.amount;
    const isPastDue = new Date(inst.dueDate) < now;

    if (isPastDue) {
      cumulativeDue += inst.amount;
    }

    if (!nextInstallment && runningInstallmentTotal > totalPaid) {
      nextInstallment = {
        installmentNumber: inst.installmentNumber,
        title: inst.title,
        dueDate: inst.dueDate,
        amount: inst.amount,
        remainingForThisInstallment: runningInstallmentTotal - totalPaid,
      };
    }
  }

  if (cumulativeDue > totalPaid) {
    overdueAmount = cumulativeDue - totalPaid;
  }

  let status = 'paid';
  if (balance > 0) {
    if (overdueAmount > 0) {
      status = 'overdue';
    } else if (totalPaid > 0) {
      status = 'partial';
    } else {
      status = 'pending';
    }
  }

  return {
    feeAccount,
    totalAgreedFee: feeAccount.totalAgreedFee,
    totalPaid,
    balance,
    overdueAmount,
    status,
    nextInstallment,
    payments,
  };
};

// Admin: Set or update Fee Account & Installments
export const setFeeAccount = async (req, res, next) => {
  try {
    const { studentId, totalAgreedFee, installments, notes } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== ROLES.STUDENT) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    let feeAccount = await FeeAccount.findOne({ student: studentId });

    if (feeAccount) {
      if (totalAgreedFee !== undefined) feeAccount.totalAgreedFee = totalAgreedFee;
      if (installments) feeAccount.installments = installments;
      if (notes !== undefined) feeAccount.notes = notes;
      await feeAccount.save();
    } else {
      feeAccount = await FeeAccount.create({
        student: studentId,
        course: student.desiredCourse,
        batch: student.activeBatch,
        totalAgreedFee,
        installments: installments || [],
        notes,
      });
    }

    await logAudit({
      action: 'FEE_ACCOUNT_CONFIGURED',
      performedBy: req.user._id,
      targetModel: 'FeeAccount',
      targetId: feeAccount._id,
      details: { totalAgreedFee, installmentsCount: installments?.length },
      req,
    });

    const summary = await computeAccountSummary(feeAccount);
    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

// Admin: Record Payment
export const recordPayment = async (req, res, next) => {
  try {
    const { studentId, amount, paymentDate, method, reference, note } = req.body;

    if (!studentId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, payment amount (in paise), and payment method are required.',
      });
    }

    let feeAccount = await FeeAccount.findOne({ student: studentId });
    if (!feeAccount) {
      return res.status(404).json({
        success: false,
        message: 'No fee account exists for this student. Please configure fee schedule first.',
      });
    }

    const payment = await Payment.create({
      student: studentId,
      feeAccount: feeAccount._id,
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      method,
      reference: reference || '',
      note: note || '',
      recordedBy: req.user._id,
    });

    await logAudit({
      action: 'PAYMENT_RECORDED',
      performedBy: req.user._id,
      targetModel: 'Payment',
      targetId: payment._id,
      details: { amount: payment.amount, method, studentId },
      req,
    });

    const summary = await computeAccountSummary(feeAccount);
    res.status(201).json({ success: true, message: 'Payment recorded successfully.', payment, summary });
  } catch (error) {
    next(error);
  }
};

// Admin: Cancel erroneous payment (Audit trail)
export const cancelPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    if (payment.isCancelled) {
      return res.status(400).json({ success: false, message: 'Payment has already been cancelled.' });
    }

    payment.isCancelled = true;
    payment.cancelledReason = reason || 'Erroneous entry correction';
    payment.cancelledAt = new Date();
    payment.cancelledBy = req.user._id;
    await payment.save();

    await logAudit({
      action: 'PAYMENT_CANCELLED',
      performedBy: req.user._id,
      targetModel: 'Payment',
      targetId: payment._id,
      details: { amount: payment.amount, reason },
      req,
    });

    res.status(200).json({ success: true, message: 'Payment record cancelled with audit trail.' });
  } catch (error) {
    next(error);
  }
};

// Student: View own fees
export const getMyFeeDetails = async (req, res, next) => {
  try {
    const feeAccount = await FeeAccount.findOne({ student: req.user._id })
      .populate('course', 'name code')
      .populate('batch', 'name code');

    if (!feeAccount) {
      return res.status(200).json({
        success: true,
        hasAccount: false,
        message: 'No fee account configured yet. Your fee schedule will be available upon batch allocation.',
      });
    }

    const summary = await computeAccountSummary(feeAccount);
    res.status(200).json({ success: true, hasAccount: true, ...summary });
  } catch (error) {
    next(error);
  }
};

// Teacher / Admin: Batch student fee statuses
export const getBatchFeeStatuses = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedBatches?.some(
        (b) => b.toString() === batchId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Access denied: Unassigned batch.' });
      }
    }

    const students = await User.find({
      activeBatch: batchId,
      role: ROLES.STUDENT,
      isActive: true,
    }).select('name email phone');

    const statuses = await Promise.all(
      students.map(async (st) => {
        const acc = await FeeAccount.findOne({ student: st._id });
        if (!acc) {
          return {
            studentId: st._id,
            name: st.name,
            email: st.email,
            phone: req.user.role === ROLES.ADMIN ? st.phone : undefined,
            totalAgreedFee: 0,
            totalPaid: 0,
            balance: 0,
            status: 'not_set',
          };
        }
        const summary = await computeAccountSummary(acc);
        return {
          studentId: st._id,
          feeAccountId: acc._id,
          name: st.name,
          email: st.email,
          phone: req.user.role === ROLES.ADMIN ? st.phone : undefined,
          totalAgreedFee: summary.totalAgreedFee,
          totalPaid: summary.totalPaid,
          balance: summary.balance,
          overdueAmount: summary.overdueAmount,
          status: summary.status,
          nextInstallment: summary.nextInstallment,
        };
      })
    );

    res.status(200).json({ success: true, count: statuses.length, statuses });
  } catch (error) {
    next(error);
  }
};
