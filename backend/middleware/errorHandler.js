import ApiError from '../utils/ApiError.js';

/**
 * Centralized error-handling middleware. Every thrown/forwarded error in
 * the app funnels through here so responses stay consistent and no stack
 * traces or internal details leak to clients in production.
 */
export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let { statusCode, message, details } = err instanceof ApiError
    ? err
    : { statusCode: 500, message: 'Internal server error', details: null };

  // Translate common Mongoose/Mongo errors into clean client-facing messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already exists`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier format';
  }

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal server error';

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
  });
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
