import { Router } from 'express';
import { ForumService } from './forum.service';
import { authenticate, AuthRequest } from '../../core/middleware/auth';
import { sendSuccess } from '../../core/utils/response';

const router = Router();
const forumService = new ForumService();

router.use(authenticate);

// ── Channels ──
router.get('/channels', async (req, res, next) => {
  try {
    const channels = await forumService.getChannels();
    sendSuccess(res, channels);
  } catch (error) { next(error); }
});

// ── Threads ──
router.get('/channels/:channelId/threads', async (req, res, next) => {
  try {
    const threads = await forumService.getThreads(req.params.channelId);
    sendSuccess(res, threads);
  } catch (error) { next(error); }
});

router.post('/channels/:channelId/threads', async (req: AuthRequest, res, next) => {
  try {
    const { title, content } = req.body;
    const thread = await forumService.createThread(req.params.channelId, { title, content, authorId: req.userId! });
    sendSuccess(res, thread, 'Thread created', 201);
  } catch (error) { next(error); }
});

// ── Comments ──
router.get('/threads/:threadId/comments', async (req, res, next) => {
  try {
    const comments = await forumService.getComments(req.params.threadId);
    sendSuccess(res, comments);
  } catch (error) { next(error); }
});

export { router as forumRoutes };
