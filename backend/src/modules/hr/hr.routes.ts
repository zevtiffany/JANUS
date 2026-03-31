import { Router } from 'express';
import { HRService } from './hr.service';
import { authenticate } from '../../core/middleware/auth';
import { sendSuccess } from '../../core/utils/response';

const router = Router();
const hrService = new HRService();

router.use(authenticate);

// ── HR Dashboard Summary ──
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await hrService.getHrSummary();
    sendSuccess(res, summary);
  } catch (error) { next(error); }
});

// ── Employees ──
router.get('/employees', async (req, res, next) => {
  try {
    const employees = await hrService.getEmployees();
    sendSuccess(res, employees);
  } catch (error) { next(error); }
});

// ── Departments ──
router.get('/departments', async (req, res, next) => {
  try {
    const departments = await hrService.getDepartments();
    sendSuccess(res, departments);
  } catch (error) { next(error); }
});

export { router as hrRoutes };
