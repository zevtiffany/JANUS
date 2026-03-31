import { Router } from 'express';
import { DocumentsService } from './documents.service';
import { authenticate, AuthRequest } from '../../core/middleware/auth';
import { sendSuccess } from '../../core/utils/response';

const router = Router();
const documentsService = new DocumentsService();

router.use(authenticate);

// ── Folders ──
router.get('/folders/:id?', async (req, res, next) => {
  try {
    // If no ID is provided, fetch root folders
    const parentId = (req.params as any).id || null;
    const folders = await documentsService.getFolders(parentId);
    sendSuccess(res, folders);
  } catch (error) { next(error); }
});

router.post('/folders', async (req: AuthRequest, res, next) => {
  try {
    const { name, parentId } = req.body;
    const folder = await documentsService.createFolder({ name, parentId, createdById: req.userId! });
    sendSuccess(res, folder, 'Folder created', 201);
  } catch (error) { next(error); }
});

// ── Documents ──
router.get('/files/:folderId?', async (req, res, next) => {
  try {
    const folderId = (req.params as any).folderId || null;
    const files = await documentsService.getDocuments(folderId);
    sendSuccess(res, files);
  } catch (error) { next(error); }
});

// Simulated upload endpoint
router.post('/upload', async (req: AuthRequest, res, next) => {
  try {
    const { name, folderId, size, mimeType } = req.body;
    
    // In a real app we'd use multer and parse req.file
    // For now we simulate inserting metadata
    const document = await documentsService.simulateUpload({
      name,
      folderId,
      size: size || 1024,
      mimeType: mimeType || 'application/pdf',
      uploadedById: req.userId!
    });
    
    sendSuccess(res, document, 'Document metadata created', 201);
  } catch (error) { next(error); }
});

export { router as documentRoutes };
