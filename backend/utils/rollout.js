import crypto from 'crypto';

/**
 * Deterministic bucketing for percentage rollouts.
 *
 * Given a stable identifier (user id or email) and a feature key, this
 * produces a stable integer bucket in the range [0, 99]. The same
 * identifier + feature key ALWAYS maps to the same bucket, which is what
 * gives users a consistent experience across sessions and refreshes
 * (unlike naively enabling the feature for "the first X% of users",
 * which changes as the user list grows/shrinks).
 *
 * Algorithm:
 *  1. Concatenate featureKey + identifier into a single string so the
 *     bucket is specific to this feature (a user can be in-bucket for
 *     one flag and out-of-bucket for another).
 *  2. Hash it with SHA-256 (well distributed, deterministic).
 *  3. Take the first 8 hex characters, parse as an integer.
 *  4. Modulo 100 to get a bucket between 0-99.
 */
export const getBucketForUser = (featureKey, identifier) => {
  const input = `${featureKey}:${identifier}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  const intFromHash = parseInt(hash.slice(0, 8), 16);
  return intFromHash % 100;
};

/**
 * Determines if a specific user should see the feature, combining:
 *  - the master enable/disable toggle
 *  - the scheduled release time (if any)
 *  - deterministic percentage rollout bucketing
 */
export const evaluateFlagForUser = (flag, identifier, now = new Date()) => {
  if (!flag.isEnabled) {
    return { enabled: false, reason: 'disabled' };
  }
  if (flag.scheduledReleaseAt && new Date(flag.scheduledReleaseAt) > now) {
    return { enabled: false, reason: 'scheduled', scheduledReleaseAt: flag.scheduledReleaseAt };
  }
  const bucket = getBucketForUser(flag.key, identifier);
  const inRollout = bucket < flag.rolloutPercentage;
  return {
    enabled: inRollout,
    reason: inRollout ? 'rollout_included' : 'rollout_excluded',
    bucket,
    rolloutPercentage: flag.rolloutPercentage,
  };
};
