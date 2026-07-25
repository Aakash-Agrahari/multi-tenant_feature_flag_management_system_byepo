import mongoose from 'mongoose';

const featureFlagSchema = new mongoose.Schema(
  {
    key: {
      // Machine-readable identifier, e.g. "new-checkout-flow"
      type: String,
      required: [true, 'Feature key is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9][a-z0-9-_]*$/, 'Key may only contain lowercase letters, numbers, hyphens, underscores'],
      minlength: 2,
      maxlength: 80,
    },
    name: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    isEnabled: {
      // Master kill-switch. If false, feature is off regardless of rollout %.
      type: Boolean,
      default: false,
    },
    rolloutPercentage: {
      // 0-100. Deterministic bucketing decides who gets the feature.
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    scheduledReleaseAt: {
      // Optional future timestamp. Before this time, flag is inactive
      // even if isEnabled is true. Null means no schedule constraint.
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// A feature key must be unique within an organization, but the same key
// can be reused across different organizations.
featureFlagSchema.index({ organization: 1, key: 1 }, { unique: true });
featureFlagSchema.index({ organization: 1, isEnabled: 1 });

/**
 * Determines whether the flag is "live" — i.e. its schedule (if any)
 * has passed and the master toggle is on. This does NOT account for
 * per-user percentage rollout; that's evaluated separately.
 */
featureFlagSchema.methods.isLive = function isLive(now = new Date()) {
  if (!this.isEnabled) return false;
  if (this.scheduledReleaseAt && this.scheduledReleaseAt > now) return false;
  return true;
};

export default mongoose.model('FeatureFlag', featureFlagSchema);
