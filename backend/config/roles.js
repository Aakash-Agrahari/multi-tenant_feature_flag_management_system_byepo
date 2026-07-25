/**
 * Centralized role constants to avoid magic strings across the codebase.
 */
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  END_USER: 'end_user',
});

export const ROLE_VALUES = Object.values(ROLES);
