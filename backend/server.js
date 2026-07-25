import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { startScheduledReleaseChecker } from './scripts/scheduledReleaseChecker.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Scheduled releases are evaluated live on every read (see flagController
  // / rollout.js), so no data mutation is strictly required for correctness.
  // This background job simply logs upcoming releases as they go live, and
  // is a natural extension point if a future feature needs a webhook/event
  // fired the moment a scheduled release activates.
  startScheduledReleaseChecker();

  app.listen(PORT, () => {
    console.log(`[server] Feature Flag API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start();
