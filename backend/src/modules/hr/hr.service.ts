import { prisma } from '../../config/database';

export class HRService {
  async getHrSummary() {
    const [totalEmployees, activeEmployees, departments, attendanceToday] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.department.count(),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      departments,
      attendanceToday,
      turnoverRate: 2.5, // Mock value
    };
  }

  async getEmployees() {
    return prisma.employee.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
        department: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getDepartments() {
    return prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
