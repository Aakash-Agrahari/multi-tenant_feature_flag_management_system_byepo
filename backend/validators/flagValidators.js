import { body } from 'express-validator';

export const createFlagValidator = [
  body('key')
    .trim()
    .notEmpty()
    .withMessage('Feature key is required')
    .matches(/^[a-z0-9][a-z0-9-_]*$/i)
    .withMessage('Key may only contain letters, numbers, hyphens, underscores'),
  body('name').trim().notEmpty().withMessage('Display name is required'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('isEnabled').optional().isBoolean(),
  body('rolloutPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Rollout percentage must be 0-100'),
  body('scheduledReleaseAt').optional({ nullable: true }).isISO8601().withMessage('scheduledReleaseAt must be a valid date'),
];

export const updateFlagValidator = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('isEnabled').optional().isBoolean(),
  body('rolloutPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Rollout percentage must be 0-100'),
  body('scheduledReleaseAt').optional({ nullable: true }).isISO8601().withMessage('scheduledReleaseAt must be a valid date'),
];
