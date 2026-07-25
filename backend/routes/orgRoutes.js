import { Router } from 'express';
import {
  createOrganization,
  listOrganizations,
  getOrganization,
  getOrganizationStats,
  createOrgAdmin,
  listOrgAdmins,
} from '../controllers/orgController.js';
import { createOrgValidator, createOrgAdminValidator } from '../validators/orgValidators.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

router.post('/', createOrgValidator, validate, createOrganization);
router.get('/', listOrganizations);
router.get('/:id', getOrganization);
router.get('/:id/stats', getOrganizationStats);
router.post('/:id/admins', createOrgAdminValidator, validate, createOrgAdmin);
router.get('/:id/admins', listOrgAdmins);

export default router;
