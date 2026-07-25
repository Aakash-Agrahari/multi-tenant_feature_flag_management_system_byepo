import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import User from '../models/User.js';
import { ROLES } from '../config/roles.js';
import mongoose from 'mongoose';

/**
 * Bootstraps the single Super Admin account from environment variables.
 * Run with: npm run seed:superadmin
 * Safe to re-run — it will not create a duplicate.
 */
const run = async () => {
  await connectDB();

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.error('[seed] SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await User.findOne({ email, role: ROLES.SUPER_ADMIN });
  if (existing) {
    console.log(`[seed] Super Admin already exists: ${email}`);
  } else {
    await User.create({ name, email, password, role: ROLES.SUPER_ADMIN });
    console.log(`[seed] Super Admin created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
