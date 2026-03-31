import { prisma } from '../../config/database';
import { eventBus } from '../../core/events/eventBus';
import { AppError } from '../../core/middleware/errorHandler';

export class ProjectsService {
  async getProjects(skip: number, limit: number, filters: Record<string, string>) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          manager: { select: { firstName: true, lastName: true } },
          _count: { select: { tasks: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);
    return { data, total };
  }

  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { firstName: true, lastName: true, email: true } },
        tasks: {
          include: { assignee: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) throw new AppError('Project not found', 404);

    const taskStats = {
      total: project.tasks.length,
      todo: project.tasks.filter(t => t.status === 'TODO').length,
      inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: project.tasks.filter(t => t.status === 'IN_REVIEW').length,
      completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
    };

    return { ...project, taskStats };
  }

  async createProject(data: any, userId: string) {
    return prisma.project.create({
      data: { ...data, managerId: userId },
      include: { manager: { select: { firstName: true, lastName: true } } },
    });
  }

  async updateProject(id: string, data: any) {
    return prisma.project.update({ where: { id }, data });
  }

  async getTasksByProject(projectId: string, filters: Record<string, string>) {
    const where: any = { projectId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;

    return prisma.task.findMany({
      where, orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        _count: { select: { timesheets: true } },
      },
    });
  }

  async createTask(projectId: string, data: any) {
    return prisma.task.create({
      data: { ...data, projectId },
      include: { assignee: { select: { firstName: true, lastName: true } } },
    });
  }

  async updateTask(taskId: string, data: any) {
    const oldTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!oldTask) throw new AppError('Task not found', 404);

    const updated = await prisma.task.update({
      where: { id: taskId }, data,
      include: { assignee: { select: { firstName: true, lastName: true } }, project: true },
    });

    if (data.status && data.status !== oldTask.status) {
      await eventBus.emit('projects:task.statusChanged', {
        taskId, newStatus: data.status, oldStatus: oldTask.status,
        projectId: updated.projectId,
      });
    }

    return updated;
  }

  async getTimesheets(skip: number, limit: number, filters: Record<string, string>) {
    const where: any = {};
    if (filters.taskId) where.taskId = filters.taskId;
    if (filters.userId) where.userId = filters.userId;

    const [data, total] = await Promise.all([
      prisma.timesheet.findMany({
        where, skip, take: limit, orderBy: { date: 'desc' },
        include: {
          task: { select: { title: true, project: { select: { name: true } } } },
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.timesheet.count({ where }),
    ]);
    return { data, total };
  }

  async logTime(data: any, userId: string) {
    const timesheet = await prisma.timesheet.create({
      data: { ...data, userId },
    });

    // Update task actual hours
    await prisma.task.update({
      where: { id: data.taskId },
      data: { actualHours: { increment: data.hours } },
    });

    return timesheet;
  }

  async getProjectsSummary() {
    const [totalProjects, activeProjects, completedProjects, overdueTasks, totalHoursLogged] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      prisma.timesheet.aggregate({ _sum: { hours: true } }),
    ]);

    const recentProjects = await prisma.project.findMany({
      take: 5, orderBy: { updatedAt: 'desc' },
      include: { manager: { select: { firstName: true, lastName: true } }, _count: { select: { tasks: true } } },
    });

    return { totalProjects, activeProjects, completedProjects, overdueTasks, totalHoursLogged: Number(totalHoursLogged._sum.hours || 0), recentProjects };
  }
}
