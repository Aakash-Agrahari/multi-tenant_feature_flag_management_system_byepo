import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES, ROLE_VALUES } from '../config/roles.js';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      required: true,
    },
    organization: {
      // Required for org_admin and end_user, null for super_admin
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index: fast per-organization user lookups and enforces
// that within a real deployment we can quickly scope queries by org.
userSchema.index({ organization: 1, role: 1 });

userSchema.pre('validate', function enforceOrgRules(next) {
  if (this.role === ROLES.SUPER_ADMIN && this.organization) {
    return next(new Error('Super Admin must not belong to an organization'));
  }
  if ((this.role === ROLES.ORG_ADMIN || this.role === ROLES.END_USER) && !this.organization) {
    return next(new Error('Organization is required for this role'));
  }
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
