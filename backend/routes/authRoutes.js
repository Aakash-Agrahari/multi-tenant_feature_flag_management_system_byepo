import { Router } from 'express';
import { superAdminLogin, orgAdminSignup, login, getMe } from '../controllers/authController.js';
import { orgSignupValidator, loginValidator } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/super-admin/login', loginValidator, validate, superAdminLogin);
router.post('/org-admin/signup', orgSignupValidator, validate, orgAdminSignup);
router.post('/login', loginValidator, validate, login);
router.get('/me', authenticate, getMe);

export default router;
