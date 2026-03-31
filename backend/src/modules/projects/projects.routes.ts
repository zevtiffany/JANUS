import { Router } from 'express';
import { ProjectsService } from './projects.service';
import { authenticate, AuthRequest } from '../../core/middleware/auth';
import { validate } from '../../core/middleware/validate';
import { createProjectSchema, createTaskSchema, createTimesheetSchema } from './projects.validator';
import { sendSuccess, sendPaginated } from '../../core/utils/response';
import { parsePagination } from '../../core/utils/pagination';

const router = Router();
const projectsService = new ProjectsService();

router.use(authenticate);

// ── Projects ──
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const { data, total } = await projectsService.getProjects(skip, limit, req.query as any);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const summary = await projectsService.getProjectsSummary();
    sendSuccess(res, summary);
  } catch (error) { next(error); }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await projectsService.getProjectById(req.params.id);
    sendSuccess(res, project);
  } catch (error) { next(error); }
});

router.post('/', validate(createProjectSchema), async (req: AuthRequest, res, next) => {
  try {
    const project = await projectsService.createProject(req.body, req.userId!);
    sendSuccess(res, project, 'Project created', 201);
  } catch (error) { next(error); }
});

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body);
    sendSuccess(res, project, 'Project updated');
  } catch (error) { next(error); }
});

// ── Tasks ──
router.get('/:projectId/tasks', async (req: AuthRequest, res, next) => {
  try {
    const tasks = await projectsService.getTasksByProject(req.params.projectId, req.query as any);
    sendSuccess(res, tasks);
  } catch (error) { next(error); }
});

router.post('/:projectId/tasks', validate(createTaskSchema), async (req: AuthRequest, res, next) => {
  try {
    const task = await projectsService.createTask(req.params.projectId, req.body);
    sendSuccess(res, task, 'Task created', 201);
  } catch (error) { next(error); }
});

router.put('/tasks/:taskId', async (req: AuthRequest, res, next) => {
  try {
    const task = await projectsService.updateTask(req.params.taskId, req.body);
    sendSuccess(res, task, 'Task updated');
  } catch (error) { next(error); }
});

// ── Timesheets ──
router.get('/timesheets/all', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const { data, total } = await projectsService.getTimesheets(skip, limit, req.query as any);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.post('/timesheets/log', validate(createTimesheetSchema), async (req: AuthRequest, res, next) => {
  try {
    const timesheet = await projectsService.logTime(req.body, req.userId!);
    sendSuccess(res, timesheet, 'Time logged', 201);
  } catch (error) { next(error); }
});

export { router as projectRoutes };
