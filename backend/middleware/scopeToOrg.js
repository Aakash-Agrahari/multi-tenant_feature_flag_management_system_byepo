import ApiError from '../utils/ApiError.js';
import { ROLES } from '../config/roles.js';

/**
 * Ensures organization-scoped resources are only accessible by members of
 * that organization. Super Admins may pass an explicit organization query
 * param since they operate across orgs; org_admin/end_user are always
 * pinned to their own organization from the JWT-derived user record.
 *
 * Attaches req.orgId — the organization id that should be used to filter
 * all downstream queries — so controllers never trust client input for
 * tenant isolation.
 */
export const scopeToOrg = (req, res, next) => {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    // Super admin may target a specific org via query/body, else sees all
    req.orgId = req.query.organization || req.body.organization || null;
    return next();
  }

  if (!req.user.organization) {
    return next(new ApiError(403, 'User is not associated with an organization'));
  }

  req.orgId = req.user.organization.toString();
  next();
};
