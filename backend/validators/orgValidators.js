import { body } from 'express-validator';

export const createOrgValidator = [
  body('name').trim().notEmpty().withMessage('Organization name is required').isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

export const createOrgAdminValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];
