import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ROLES } from '../config/constants.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jee_academy_super_secret_jwt_key_2026';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been deactivated.',
      });
    }

    // CSRF Check for state-mutating requests when token came from cookie
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.cookies?.token) {
      const csrfHeader = req.headers['x-csrf-token'];
      const csrfCookie = req.cookies.csrf_token;
      if (csrfCookie && csrfHeader && csrfHeader !== csrfCookie) {
        return res.status(403).json({
          success: false,
          message: 'CSRF verification failed. Request blocked.',
        });
      }
    }

    // Don't leak password hash to req.user
    user.password = undefined;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] role.`,
      });
    }
    next();
  };
};

export const requireBatchAccess = (batchIdParamName = 'batchId') => {
  return (req, res, next) => {
    const batchId = req.params[batchIdParamName] || req.body[batchIdParamName] || req.query[batchIdParamName];
    if (!batchId) {
      return res.status(400).json({ success: false, message: 'Batch ID is required' });
    }

    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (req.user.role === ROLES.TEACHER) {
      const hasBatch = req.user.assignedBatches?.some(
        (b) => b.toString() === batchId.toString()
      );
      if (!hasBatch) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this batch.',
        });
      }
      return next();
    }

    if (req.user.role === ROLES.STUDENT) {
      if (req.user.activeBatch?.toString() !== batchId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not belong to this batch.',
        });
      }
      return next();
    }

    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
};
