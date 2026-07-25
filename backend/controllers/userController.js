import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import User from '../models/User.js';
import { ROLES } from '../config/roles.js';

/**
 * POST /api/users/end-users  (Org Admin only)
 * The assignment spec doesn't define an End User signup flow, so — as in
 * most real feature-flag platforms — end users are provisioned by the
 * Organization Admin rather than self-registering.
 */
export const createEndUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.END_USER,
    organization: req.orgId,
  });

  sendSuccess(res, 201, 'End user created', { user: user.toSafeObject() });
});

/**
 * GET /api/users/end-users  (Org Admin only)
 */
export const listEndUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ organization: req.orgId, role: ROLES.END_USER }).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'End users fetched', { users });
});
