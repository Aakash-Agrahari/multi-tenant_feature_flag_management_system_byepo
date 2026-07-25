import { Router } from 'express';
import {
  createFlag,
  listFlags,
  getFlag,
  updateFlag,
  toggleFlag,
  deleteFlag,
  evaluateFlag,
  evaluateAllFlags,
} from '../controllers/flagController.js';
import { createFlagValidator, updateFlagValidator } from '../validators/flagValidators.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { scopeToOrg } from '../middleware/scopeToOrg.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);

// End User evaluation routes (read-only, no mutation rights)
router.get('/evaluate', authorize(ROLES.END_USER), scopeToOrg, evaluateAllFlags);
router.get('/evaluate/:key', authorize(ROLES.END_USER), scopeToOrg, evaluateFlag);

// Org Admin management routes
router.use(authorize(ROLES.ORG_ADMIN), scopeToOrg);
router.post('/', createFlagValidator, validate, createFlag);
router.get('/', listFlags);
router.get('/:id', getFlag);
router.patch('/:id', updateFlagValidator, validate, updateFlag);
router.patch('/:id/toggle', toggleFlag);
router.delete('/:id', deleteFlag);

export default router;
