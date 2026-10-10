import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({ action, performedBy, targetModel, targetId, details, req }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    await AuditLog.create({
      action,
      performedBy,
      targetModel,
      targetId,
      details,
      ipAddress: String(ipAddress),
    });
  } catch (err) {
    console.error('[AuditLog] Error writing audit log:', err);
  }
};
