import { prisma } from '../../config/database';

export class DocumentsService {
  async getFolders(parentId: string | null) {
    return prisma.folder.findMany({
      where: { parentId },
      include: {
        _count: { select: { children: true, documents: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createFolder(data: { name: string; parentId?: string; createdById: string }) {
    return prisma.folder.create({
      data: {
        name: data.name,
        parentId: data.parentId || null,
        createdById: data.createdById,
      },
    });
  }

  async getDocuments(folderId: string | null) {
    return prisma.document.findMany({
      where: { folderId },
      include: {
        uploadedBy: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async simulateUpload(data: { name: string; folderId?: string; size: number; mimeType: string; uploadedById: string }) {
    return prisma.document.create({
      data: {
        name: data.name,
        filePath: `/simulated/uploads/${Date.now()}_${data.name}`,
        mimeType: data.mimeType,
        size: data.size,
        folderId: data.folderId || null,
        uploadedById: data.uploadedById,
      },
    });
  }
}
