import { Router } from 'express';
import { AuthService } from './auth.service';
import { validate } from '../../core/middleware/validate';
import { loginSchema, registerSchema } from './auth.validator';
import { authenticate, AuthRequest } from '../../core/middleware/auth';
import { sendSuccess, sendError } from '../../core/utils/response';

const router = Router();
const authService = new AuthService();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      sendError(res, error.message, 409);
    } else {
      next(error);
    }
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    sendError(res, error.message, 401);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getProfile(req.userId!);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400);
      return;
    }
    const result = await authService.refreshToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (error: any) {
    sendError(res, error.message, 401);
  }
});

export { router as authRoutes };
