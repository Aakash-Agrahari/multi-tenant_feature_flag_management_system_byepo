import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { scopeToOrg } from '../middleware/scopeToOrg.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ORG_ADMIN), scopeToOrg);
router.get('/', listAuditLogs);

export default router;
