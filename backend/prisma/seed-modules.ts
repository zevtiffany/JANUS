import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HR, Documents, and Forum modules mock data...');

  // 1. Get or Create Admin User to act as the creator/uploader
  let adminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { name: 'Super Admin' } });
  }

  let user = await prisma.user.findFirst();
  const validPassword = await bcrypt.hash('admin123', 12);
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@janus.dev',
        password: validPassword,
        firstName: 'System',
        lastName: 'Admin',
        roleId: adminRole.id,
      },
    });
  } else {
    // Ensure existing user has the valid password for testing
    await prisma.user.update({
      where: { id: user.id },
      data: { password: validPassword, email: 'admin@janus.dev' }
    });
  }

  // --- HR MODULE MOCK DATA ---
  const engDept = await prisma.department.findUnique({ where: { name: 'Engineering' } });
  if (!engDept) {
    console.log('Creating Departments and Employees...');
    const d1 = await prisma.department.create({ data: { name: 'Engineering' } });
    const d2 = await prisma.department.create({ data: { name: 'Human Resources' } });
    const d3 = await prisma.department.create({ data: { name: 'Sales' } });

    // Ensure we don't try to create employees with existing userId
    // I am safely skipping actual user account creation for the employees to keep the seed simple
    // but the Prisma schema says `employee.userId` is required and @unique. 
    // Thus I must create matching Users first.
    
    for(let i = 1; i <= 5; i++) {
        const dummyUser = await prisma.user.create({
            data: {
                email: `emp${i}@janus.dev`,
                password: validPassword,
                firstName: `Employee`,
                lastName: `#${i}`,
                roleId: adminRole.id,
            }
        });
        await prisma.employee.create({
            data: {
                userId: dummyUser.id,
                employeeCode: `EMP-${1000 + i}`,
                position: 'Software Engineer',
                salary: 80000 + (1000 * i),
                hireDate: new Date(),
                departmentId: i % 2 === 0 ? d1.id : d3.id,
            }
        });
        
        // Add attendance today
        await prisma.attendance.create({
            data: {
                employeeId: dummyUser.id,
                date: new Date(),
                checkIn: new Date(new Date().setHours(8, 30, 0, 0)),
                status: 'PRESENT'
            }
        });
    }
  }

  // --- FORUM MODULE MOCK DATA ---
  const genChannel = await prisma.channel.findFirst({ where: { name: 'General' } });
  if (!genChannel) {
    console.log('Creating Forum Channels and Threads...');
    const c1 = await prisma.channel.create({ data: { name: 'General', type: 'GENERAL' } });
    const c2 = await prisma.channel.create({ data: { name: 'Announcements', type: 'ANNOUNCEMENT' } });

    const thread1 = await prisma.thread.create({
        data: {
            channelId: c2.id,
            title: 'Welcome to JANUS!',
            content: 'Please use this platform for all internal communications.',
            authorId: user.id,
            isPinned: true
        }
    });

    await prisma.comment.create({
        data: {
            threadId: thread1.id,
            content: 'Glad to be here!',
            authorId: user.id
        }
    });
  }

  // --- DOCUMENT MODULE MOCK DATA ---
  const docsFolder = await prisma.folder.findFirst({ where: { name: 'Company Policies' } });
  if (!docsFolder) {
    console.log('Creating Document Folders and Files...');
    const f1 = await prisma.folder.create({ data: { name: 'Company Policies', createdById: user.id } });
    const f2 = await prisma.folder.create({ data: { name: 'Templates', createdById: user.id } });

    await prisma.document.create({
        data: {
            name: 'Employee Handbook 2026.pdf',
            filePath: '/mock/Employee Handbook 2026.pdf',
            mimeType: 'application/pdf',
            size: 2048000,
            folderId: f1.id,
            uploadedById: user.id
        }
    });
  }

  console.log('✅ Seeding Complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
