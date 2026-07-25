import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import AuditLog from '../models/AuditLog.js';

/**
 * GET /api/audit-logs  (Org Admin only)
 * Returns recent audit history for the caller's organization.
 * Supports pagination (?page=&limit=) and optional ?featureKey= filter.
 */
export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const query = { organization: req.orgId };
  if (req.query.featureKey) query.featureKey = req.query.featureKey.toLowerCase();

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(query),
  ]);

  sendSuccess(res, 200, 'Audit logs fetched', { logs }, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});
