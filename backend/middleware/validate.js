import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Runs after express-validator chains; collects validation errors into
 * a single, consistently-shaped 400 response.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(400, 'Validation failed', formatted));
};
