import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import flagRoutes from './routes/flagRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl/Postman) with no Origin header, and
      // any origin present in the configured allow-list.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// --- 404 + centralized error handling ---
app.use(notFound);
app.use(errorHandler);

export default app;
