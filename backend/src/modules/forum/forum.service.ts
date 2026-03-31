import { prisma } from '../../config/database';

export class ForumService {
  async getChannels() {
    return prisma.channel.findMany({
      include: {
        _count: { select: { threads: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getThreads(channelId: string) {
    return prisma.thread.findMany({
      where: { channelId },
      include: {
        author: { select: { firstName: true, lastName: true, avatar: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async createThread(channelId: string, data: { title: string; content: string; authorId: string }) {
    return prisma.thread.create({
      data: {
        channelId,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
      },
    });
  }

  async getComments(threadId: string) {
    return prisma.comment.findMany({
      where: { threadId, parentId: null },
      include: {
        author: { select: { firstName: true, lastName: true, avatar: true } },
        replies: {
          include: {
            author: { select: { firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
