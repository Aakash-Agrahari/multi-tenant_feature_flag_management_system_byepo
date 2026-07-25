import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, organization: user.organization ? user.organization.toString() : null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
