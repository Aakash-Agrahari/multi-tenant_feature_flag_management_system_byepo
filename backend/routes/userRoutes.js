import { Router } from 'express';
import { createEndUser, listEndUsers } from '../controllers/userController.js';
import { endUserCreateValidator } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { scopeToOrg } from '../middleware/scopeToOrg.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ORG_ADMIN), scopeToOrg);
router.post('/end-users', endUserCreateValidator, validate, createEndUser);
router.get('/end-users', listEndUsers);

export default router;
