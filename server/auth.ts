import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { User, Role } from '../src/types';

const JWT_SECRET = process.env.AUTH_SECRET || 'comfort_luxury_fashion_secret_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  exp: number;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadStr)
      .digest('base64url');

    if (signature !== expectedSig) return null;
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (payload) {
    const user = db.getUserById(payload.userId);
    if (user && user.status === 'active') {
      req.user = user;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const adminRoles: Role[] = ['super_admin', 'admin', 'inventory_manager', 'order_manager'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
  }
  next();
}
