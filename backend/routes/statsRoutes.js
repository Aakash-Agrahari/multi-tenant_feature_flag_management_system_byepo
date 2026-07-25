import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { scopeToOrg } from '../middleware/scopeToOrg.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ORG_ADMIN), scopeToOrg);
router.get('/dashboard', getDashboardStats);

export default router;
