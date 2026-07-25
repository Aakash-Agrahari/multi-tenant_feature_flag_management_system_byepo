import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import FeatureFlag from '../models/FeatureFlag.js';
import AuditLog from '../models/AuditLog.js';
import { evaluateFlagForUser } from '../utils/rollout.js';

/**
 * Writes an audit record. Kept as a small helper so every mutating
 * controller records history the same way.
 */
const recordAudit = async ({ organization, flag, featureKey, action, user, previousState, newState }) => {
  await AuditLog.create({
    organization,
    featureFlag: flag ? flag._id : null,
    featureKey,
    action,
    performedBy: user._id,
    performedByName: user.name,
    previousState,
    newState,
  });
};

const snapshot = (flag) => ({
  key: flag.key,
  name: flag.name,
  description: flag.description,
  isEnabled: flag.isEnabled,
  rolloutPercentage: flag.rolloutPercentage,
  scheduledReleaseAt: flag.scheduledReleaseAt,
});

/**
 * POST /api/flags  (Org Admin only)
 */
export const createFlag = asyncHandler(async (req, res) => {
  const { key, name, description, isEnabled, rolloutPercentage, scheduledReleaseAt } = req.body;
  const organization = req.orgId;

  const existing = await FeatureFlag.findOne({ organization, key: key.toLowerCase() });
  if (existing) throw new ApiError(409, 'A feature flag with this key already exists in your organization');

  const flag = await FeatureFlag.create({
    key: key.toLowerCase(),
    name,
    description,
    organization,
    isEnabled: isEnabled ?? false,
    rolloutPercentage: rolloutPercentage ?? 100,
    scheduledReleaseAt: scheduledReleaseAt || null,
    createdBy: req.user._id,
  });

  await recordAudit({
    organization,
    flag,
    featureKey: flag.key,
    action: 'CREATE',
    user: req.user,
    previousState: null,
    newState: snapshot(flag),
  });

  sendSuccess(res, 201, 'Feature flag created', { flag });
});

/**
 * GET /api/flags  (Org Admin only)
 * Supports search (?search=) and filter (?status=enabled|disabled|scheduled)
 */
export const listFlags = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const query = { organization: req.orgId };

  if (search) {
    query.$or = [
      { key: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  if (status === 'enabled') query.isEnabled = true;
  if (status === 'disabled') query.isEnabled = false;
  if (status === 'scheduled') query.scheduledReleaseAt = { $gt: new Date() };

  const flags = await FeatureFlag.find(query).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Feature flags fetched', { flags, count: flags.length });
});

/**
 * GET /api/flags/:id  (Org Admin only)
 */
export const getFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findOne({ _id: req.params.id, organization: req.orgId });
  if (!flag) throw new ApiError(404, 'Feature flag not found');
  sendSuccess(res, 200, 'Feature flag fetched', { flag });
});

/**
 * PATCH /api/flags/:id  (Org Admin only)
 * General update (name, description, rollout %, schedule). Enable/disable
 * has its own dedicated endpoint for clearer audit semantics, but is also
 * accepted here if included in the payload.
 */
export const updateFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findOne({ _id: req.params.id, organization: req.orgId });
  if (!flag) throw new ApiError(404, 'Feature flag not found');

  const previousState = snapshot(flag);
  const { name, description, rolloutPercentage, scheduledReleaseAt, isEnabled } = req.body;

  if (name !== undefined) flag.name = name;
  if (description !== undefined) flag.description = description;
  if (rolloutPercentage !== undefined) flag.rolloutPercentage = rolloutPercentage;
  if (scheduledReleaseAt !== undefined) flag.scheduledReleaseAt = scheduledReleaseAt || null;
  if (isEnabled !== undefined) flag.isEnabled = isEnabled;
  flag.updatedBy = req.user._id;

  await flag.save();

  await recordAudit({
    organization: req.orgId,
    flag,
    featureKey: flag.key,
    action: 'UPDATE',
    user: req.user,
    previousState,
    newState: snapshot(flag),
  });

  sendSuccess(res, 200, 'Feature flag updated', { flag });
});

/**
 * PATCH /api/flags/:id/toggle  (Org Admin only)
 * Dedicated enable/disable endpoint — records a clean ENABLE/DISABLE
 * audit action rather than a generic UPDATE.
 */
export const toggleFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findOne({ _id: req.params.id, organization: req.orgId });
  if (!flag) throw new ApiError(404, 'Feature flag not found');

  const previousState = snapshot(flag);
  flag.isEnabled = !flag.isEnabled;
  flag.updatedBy = req.user._id;
  await flag.save();

  await recordAudit({
    organization: req.orgId,
    flag,
    featureKey: flag.key,
    action: flag.isEnabled ? 'ENABLE' : 'DISABLE',
    user: req.user,
    previousState,
    newState: snapshot(flag),
  });

  sendSuccess(res, 200, `Feature flag ${flag.isEnabled ? 'enabled' : 'disabled'}`, { flag });
});

/**
 * DELETE /api/flags/:id  (Org Admin only)
 */
export const deleteFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findOne({ _id: req.params.id, organization: req.orgId });
  if (!flag) throw new ApiError(404, 'Feature flag not found');

  const previousState = snapshot(flag);
  await flag.deleteOne();

  await recordAudit({
    organization: req.orgId,
    flag: null,
    featureKey: previousState.key,
    action: 'DELETE',
    user: req.user,
    previousState,
    newState: null,
  });

  sendSuccess(res, 200, 'Feature flag deleted', null);
});

/**
 * GET /api/flags/evaluate/:key  (End User only)
 * Evaluates whether the calling end user has this feature available,
 * combining the master toggle, schedule, and deterministic rollout bucket.
 */
export const evaluateFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findOne({ organization: req.orgId, key: req.params.key.toLowerCase() });
  if (!flag) throw new ApiError(404, 'Feature flag not found');

  const identifier = req.user.email; // stable identifier for bucketing
  const result = evaluateFlagForUser(flag, identifier);

  sendSuccess(res, 200, 'Feature evaluated', {
    key: flag.key,
    name: flag.name,
    enabled: result.enabled,
    reason: result.reason,
  });
});

/**
 * GET /api/flags/evaluate  (End User only)
 * Bulk-evaluates ALL of the end user's organization flags in one call —
 * useful for a client bootstrapping its feature set on app load.
 */
export const evaluateAllFlags = asyncHandler(async (req, res) => {
  const flags = await FeatureFlag.find({ organization: req.orgId });
  const identifier = req.user.email;

  const evaluations = flags.map((flag) => {
    const result = evaluateFlagForUser(flag, identifier);
    return { key: flag.key, name: flag.name, enabled: result.enabled, reason: result.reason };
  });

  sendSuccess(res, 200, 'Feature flags evaluated', { flags: evaluations });
});
