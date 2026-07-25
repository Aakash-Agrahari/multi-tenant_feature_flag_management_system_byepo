import { Router } from 'express';
import {
  createOrganization,
  listOrganizations,
  getOrganization,
  getOrganizationStats,
} from '../controllers/orgController.js';
import { createOrgValidator } from '../validators/orgValidators.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

router.post('/', createOrgValidator, validate, createOrganization);
router.get('/', listOrganizations);
router.get('/:id', getOrganization);
router.get('/:id/stats', getOrganizationStats);

export default router;
