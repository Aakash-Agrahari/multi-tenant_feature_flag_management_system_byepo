import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import FeatureFlag from '../models/FeatureFlag.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';

/**
 * GET /api/stats/dashboard
 * Role-aware dashboard summary:
 *  - Super Admin: platform-wide totals
 *  - Org Admin: their organization's flag totals
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  if (req.user.role === 'super_admin') {
    const [orgCount, userCount, flagCount] = await Promise.all([
      Organization.countDocuments(),
      User.countDocuments(),
      FeatureFlag.countDocuments(),
    ]);
    return sendSuccess(res, 200, 'Dashboard stats fetched', {
      scope: 'platform',
      stats: { organizations: orgCount, users: userCount, featureFlags: flagCount },
    });
  }

  const organization = req.orgId;
  const [totalFlags, enabledFlags, scheduledFlags, endUserCount] = await Promise.all([
    FeatureFlag.countDocuments({ organization }),
    FeatureFlag.countDocuments({ organization, isEnabled: true }),
    FeatureFlag.countDocuments({ organization, scheduledReleaseAt: { $gt: new Date() } }),
    User.countDocuments({ organization, role: 'end_user' }),
  ]);

  sendSuccess(res, 200, 'Dashboard stats fetched', {
    scope: 'organization',
    stats: {
      totalFlags,
      enabledFlags,
      disabledFlags: totalFlags - enabledFlags,
      scheduledFlags,
      endUserCount,
    },
  });
});
