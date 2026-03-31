import { Router } from 'express';
import { PulseService } from './pulseService';
import { authenticate } from '../middleware/auth';
import { sendSuccess } from '../utils/response';

const router = Router();
const pulseService = new PulseService();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const pulse = await pulseService.getOperationalPulse();
    sendSuccess(res, pulse);
  } catch (error) {
    next(error);
  }
});

export { router as pulseRoutes };
