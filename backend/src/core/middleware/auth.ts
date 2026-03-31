import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true, role: { select: { name: true } } },
    });

    if (!user || !user.isActive) {
      sendError(res, 'User not found or inactive', 401);
      return;
    }

    req.userId = decoded.userId;
    req.userRole = user.role.name;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }
    next();
  };
}
