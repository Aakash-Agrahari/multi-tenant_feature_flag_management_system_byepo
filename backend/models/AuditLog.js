import mongoose from 'mongoose';

const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'ENABLE', 'DISABLE'];

const auditLogSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    featureFlag: {
      // Kept even after the flag is deleted (not a hard ref requirement)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeatureFlag',
      default: null,
    },
    featureKey: {
      // Denormalized so history is readable even if the flag is later deleted
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      // Denormalized for fast display without a populate join
      type: String,
      required: true,
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ organization: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
