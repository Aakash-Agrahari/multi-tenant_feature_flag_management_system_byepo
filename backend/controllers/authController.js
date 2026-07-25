import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signToken } from '../utils/token.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { ROLES } from '../config/roles.js';

/**
 * POST /api/auth/super-admin/login
 * Super Admin has no signup flow; the account is bootstrapped via the
 * seed script from environment variables.
 */
export const superAdminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: ROLES.SUPER_ADMIN }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const token = signToken(user);
  sendSuccess(res, 200, 'Login successful', { token, user: user.toSafeObject() });
});

/**
 * POST /api/auth/org-admin/signup
 * Creates a brand new Organization AND its first Org Admin in one step.
 */
export const orgAdminSignup = asyncHandler(async (req, res) => {
  const { name, email, password, organizationName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, 'An account with this email already exists');

  const existingOrg = await Organization.findOne({ name: organizationName.trim() });
  if (existingOrg) throw new ApiError(409, 'An organization with this name already exists');

  // Create user first (without org), then org (referencing user as creator),
  // then link the user to the org — done as a short sequence since we are
  // intentionally not using multi-document transactions (single-node
  // MongoDB / no replica set assumed for this assignment).
  const tempUser = new User({ name, email, password, role: ROLES.ORG_ADMIN, organization: undefined });

  const org = await Organization.create({
    name: organizationName.trim(),
    createdBy: tempUser._id,
  });

  tempUser.organization = org._id;
  await tempUser.save();

  const token = signToken(tempUser);
  sendSuccess(res, 201, 'Organization and admin account created', {
    token,
    user: tempUser.toSafeObject(),
    organization: org,
  });
});

/**
 * POST /api/auth/login
 * Shared login endpoint for Org Admins and End Users (role is derived
 * from the stored user record, not trusted from the request).
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: { $in: [ROLES.ORG_ADMIN, ROLES.END_USER] } }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated');

  const token = signToken(user);
  sendSuccess(res, 200, 'Login successful', { token, user: user.toSafeObject() });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Current user fetched', { user: req.user.toSafeObject() });
});
