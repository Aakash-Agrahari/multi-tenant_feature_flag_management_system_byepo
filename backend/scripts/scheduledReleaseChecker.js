import cron from 'node-cron';
import FeatureFlag from '../models/FeatureFlag.js';

/**
 * Scheduled releases are evaluated LIVE on every request (see
 * utils/rollout.js -> evaluateFlagForUser, which checks
 * `scheduledReleaseAt` against the current time on each call). That
 * design means correctness never depends on a background job running —
 * a flag's state is always computed fresh, so nothing can "miss" its
 * release window even if this process restarts.
 *
 * This cron job is a lightweight operational add-on: every minute it
 * logs any flags whose scheduled release just passed, which is useful
 * for observability and is a natural place to hook in future features
 * like webhook notifications or Slack alerts when a release goes live.
 */
export const startScheduledReleaseChecker = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      const justReleased = await FeatureFlag.find({
        isEnabled: true,
        scheduledReleaseAt: { $gt: oneMinuteAgo, $lte: now },
      }).select('key name organization');

      justReleased.forEach((flag) => {
        console.log(`[scheduler] Flag "${flag.key}" (${flag.name}) is now live for org ${flag.organization}`);
      });
    } catch (err) {
      console.error('[scheduler] Error checking scheduled releases:', err.message);
    }
  });

  console.log('[scheduler] Scheduled release checker started (runs every minute)');
};
