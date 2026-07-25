import { body } from 'express-validator';

export const createOrgValidator = [
  body('name').trim().notEmpty().withMessage('Organization name is required').isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];
