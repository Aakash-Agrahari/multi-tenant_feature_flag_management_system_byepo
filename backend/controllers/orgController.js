import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import FeatureFlag from '../models/FeatureFlag.js';
import { ROLES } from '../config/roles.js';

/**
 * POST /api/organizations  (Super Admin only)
 */
export const createOrganization = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Organization.findOne({ name: name.trim() });
  if (existing) throw new ApiError(409, 'An organization with this name already exists');

  const org = await Organization.create({
    name: name.trim(),
    description,
    createdBy: req.user._id,
  });

  sendSuccess(res, 201, 'Organization created', { organization: org });
});

/**
 * GET /api/organizations  (Super Admin only)
 * Returns all organizations with lightweight member/flag counts.
 */
export const listOrganizations = asyncHandler(async (req, res) => {
  const orgs = await Organization.find().sort({ createdAt: -1 }).lean();

  const orgIds = orgs.map((o) => o._id);
  const [userCounts, flagCounts] = await Promise.all([
    User.aggregate([{ $match: { organization: { $in: orgIds } } }, { $group: { _id: '$organization', count: { $sum: 1 } } }]),
    FeatureFlag.aggregate([{ $match: { organization: { $in: orgIds } } }, { $group: { _id: '$organization', count: { $sum: 1 } } }]),
  ]);

  const userCountMap = Object.fromEntries(userCounts.map((u) => [u._id.toString(), u.count]));
  const flagCountMap = Object.fromEntries(flagCounts.map((f) => [f._id.toString(), f.count]));

  const enriched = orgs.map((org) => ({
    ...org,
    userCount: userCountMap[org._id.toString()] || 0,
    flagCount: flagCountMap[org._id.toString()] || 0,
  }));

  sendSuccess(res, 200, 'Organizations fetched', { organizations: enriched });
});

/**
 * GET /api/organizations/:id  (Super Admin only)
 */
export const getOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) throw new ApiError(404, 'Organization not found');
  sendSuccess(res, 200, 'Organization fetched', { organization: org });
});

/**
 * GET /api/organizations/:id/stats  (Super Admin only)
 * Organization-level statistics: user counts by role, flag counts, etc.
 */
export const getOrganizationStats = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) throw new ApiError(404, 'Organization not found');

  const [orgAdminCount, endUserCount, totalFlags, enabledFlags, scheduledFlags] = await Promise.all([
    User.countDocuments({ organization: org._id, role: 'org_admin' }),
    User.countDocuments({ organization: org._id, role: 'end_user' }),
    FeatureFlag.countDocuments({ organization: org._id }),
    FeatureFlag.countDocuments({ organization: org._id, isEnabled: true }),
    FeatureFlag.countDocuments({ organization: org._id, scheduledReleaseAt: { $gt: new Date() } }),
  ]);

  sendSuccess(res, 200, 'Organization stats fetched', {
    organization: { id: org._id, name: org.name },
    stats: {
      orgAdminCount,
      endUserCount,
      totalUsers: orgAdminCount + endUserCount,
      totalFlags,
      enabledFlags,
      disabledFlags: totalFlags - enabledFlags,
      scheduledFlags,
    },
  });
});

export const createOrgAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const org = await Organization.findById(req.params.id);
  if (!org) throw new ApiError(404, 'Organization not found');

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const admin = await User.create({
    name,
    email,
    password,
    role: ROLES.ORG_ADMIN,
    organization: org._id,
  });

  sendSuccess(res, 201, 'Organization admin created', { admin: admin.toSafeObject() });
});

export const listOrgAdmins = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) throw new ApiError(404, 'Organization not found');

  const admins = await User.find({ organization: org._id, role: ROLES.ORG_ADMIN }).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Organization admins fetched', { admins });
});
