import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding JANUS database...');

  // ── Roles ──
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Full system access' },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: { name: 'Manager', description: 'Department-level access' },
  });

  await prisma.role.upsert({
    where: { name: 'Employee' },
    update: {},
    create: { name: 'Employee', description: 'Standard employee access' },
  });

  // ── Admin User ──
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@janus.dev' },
    update: {},
    create: {
      email: 'admin@janus.dev',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      roleId: adminRole.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@janus.dev' },
    update: {},
    create: {
      email: 'manager@janus.dev',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Manager',
      roleId: managerRole.id,
    },
  });

  // ── Chart of Accounts ──
  const accounts = [
    { code: '1000', name: 'Cash', type: 'ASSET' as const, balance: 150000 },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET' as const, balance: 45000 },
    { code: '1200', name: 'Inventory', type: 'ASSET' as const, balance: 80000 },
    { code: '1300', name: 'Equipment', type: 'ASSET' as const, balance: 120000 },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' as const, balance: 35000 },
    { code: '2100', name: 'Short-term Loans', type: 'LIABILITY' as const, balance: 50000 },
    { code: '3000', name: 'Owner Equity', type: 'EQUITY' as const, balance: 250000 },
    { code: '3100', name: 'Retained Earnings', type: 'EQUITY' as const, balance: 60000 },
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE' as const, balance: 320000 },
    { code: '4100', name: 'Service Revenue', type: 'REVENUE' as const, balance: 85000 },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' as const, balance: 180000 },
    { code: '5100', name: 'Salaries & Wages', type: 'EXPENSE' as const, balance: 95000 },
    { code: '5200', name: 'Rent Expense', type: 'EXPENSE' as const, balance: 24000 },
    { code: '5300', name: 'Utilities', type: 'EXPENSE' as const, balance: 8000 },
    { code: '5400', name: 'Office Supplies', type: 'EXPENSE' as const, balance: 3500 },
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: {},
      create: acc,
    });
  }

  // ── Categories ──
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics', description: 'Electronic devices and components' },
  });

  const office = await prisma.category.upsert({
    where: { name: 'Office Supplies' },
    update: {},
    create: { name: 'Office Supplies', description: 'Office equipment and supplies' },
  });

  const raw = await prisma.category.upsert({
    where: { name: 'Raw Materials' },
    update: {},
    create: { name: 'Raw Materials', description: 'Manufacturing raw materials' },
  });

  // ── Products ──
  const products = [
    { sku: 'ELEC-001', name: 'Wireless Keyboard', categoryId: electronics.id, unitPrice: 79.99, costPrice: 35.00, uom: 'unit' },
    { sku: 'ELEC-002', name: 'USB-C Hub', categoryId: electronics.id, unitPrice: 49.99, costPrice: 22.00, uom: 'unit' },
    { sku: 'ELEC-003', name: '27" Monitor', categoryId: electronics.id, unitPrice: 349.99, costPrice: 210.00, uom: 'unit' },
    { sku: 'OFF-001', name: 'A4 Paper Ream', categoryId: office.id, unitPrice: 8.99, costPrice: 4.50, uom: 'ream' },
    { sku: 'OFF-002', name: 'Ergonomic Chair', categoryId: office.id, unitPrice: 299.99, costPrice: 150.00, uom: 'unit' },
    { sku: 'RAW-001', name: 'Steel Sheet 4x8', categoryId: raw.id, unitPrice: 125.00, costPrice: 85.00, uom: 'sheet' },
    { sku: 'RAW-002', name: 'Copper Wire 100m', categoryId: raw.id, unitPrice: 67.50, costPrice: 45.00, uom: 'roll' },
  ];

  const createdProducts: any[] = [];
  for (const prod of products) {
    const p = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
    createdProducts.push(p);
  }

  // ── Warehouses ──
  const mainWarehouse = await prisma.warehouse.create({
    data: { name: 'Main Warehouse', location: 'Building A, Floor 1' },
  }).catch(() => prisma.warehouse.findFirst({ where: { name: 'Main Warehouse' } }));

  const secondWarehouse = await prisma.warehouse.create({
    data: { name: 'Secondary Storage', location: 'Building B' },
  }).catch(() => prisma.warehouse.findFirst({ where: { name: 'Secondary Storage' } }));

  // ── Inventory Items ──
  if (mainWarehouse) {
    for (let i = 0; i < createdProducts.length; i++) {
      const qty = [50, 120, 15, 500, 8, 30, 75][i] || 10;
      const reorder = [10, 20, 5, 100, 3, 10, 15][i] || 5;
      await prisma.inventoryItem.upsert({
        where: { productId_warehouseId: { productId: createdProducts[i].id, warehouseId: mainWarehouse.id } },
        update: {},
        create: { productId: createdProducts[i].id, warehouseId: mainWarehouse.id, quantity: qty, reorderLevel: reorder },
      });
    }
  }

  // ── Vendors ──
  await prisma.vendor.createMany({
    data: [
      { name: 'TechSupply Co', email: 'orders@techsupply.com', phone: '+1-555-0101', contactPerson: 'Mike Chen' },
      { name: 'OfficeMax Distributors', email: 'sales@officemax-dist.com', phone: '+1-555-0102', contactPerson: 'Sarah Kim' },
      { name: 'MetalWorks Inc', email: 'info@metalworks.com', phone: '+1-555-0103', contactPerson: 'Robert Steel' },
    ],
    skipDuplicates: true,
  });

  // ── Customers ──
  await prisma.customer.createMany({
    data: [
      { name: 'Acme Corporation', email: 'procurement@acme.com', phone: '+1-555-0201' },
      { name: 'Globex Industries', email: 'orders@globex.com', phone: '+1-555-0202' },
      { name: 'Stark Enterprises', email: 'supply@stark.com', phone: '+1-555-0203' },
      { name: 'Wayne Technologies', email: 'vendor@wayne.com', phone: '+1-555-0204' },
    ],
    skipDuplicates: true,
  });

  // ── Departments ──
  const engDept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' },
  });

  await prisma.department.upsert({
    where: { name: 'Sales' },
    update: {},
    create: { name: 'Sales' },
  });

  await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: { name: 'Finance' },
  });

  // ── Projects ──
  const project1 = await prisma.project.create({
    data: {
      name: 'ERP System Implementation',
      description: 'Deploy and configure the JANUS ERP system across all departments',
      status: 'ACTIVE',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-30'),
      budget: 75000,
      spent: 28500,
      managerId: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      status: 'ACTIVE',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-05-15'),
      budget: 35000,
      spent: 12000,
      managerId: manager.id,
    },
  });

  await prisma.project.create({
    data: {
      name: 'Q2 Marketing Campaign',
      description: 'Launch cross-channel marketing campaign for Q2',
      status: 'PLANNING',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      budget: 50000,
      managerId: manager.id,
    },
  });

  // ── Tasks ──
  const taskData = [
    { projectId: project1.id, title: 'Database schema design', status: 'COMPLETED' as const, priority: 'HIGH' as const, dueDate: new Date('2026-02-01'), estimatedHours: 40, actualHours: 38 },
    { projectId: project1.id, title: 'API development', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, dueDate: new Date('2026-03-15'), estimatedHours: 120, actualHours: 85 },
    { projectId: project1.id, title: 'Frontend dashboard', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, dueDate: new Date('2026-04-01'), estimatedHours: 80, actualHours: 30 },
    { projectId: project1.id, title: 'Testing & QA', status: 'TODO' as const, priority: 'HIGH' as const, dueDate: new Date('2026-05-15'), estimatedHours: 60 },
    { projectId: project1.id, title: 'User training', status: 'TODO' as const, priority: 'MEDIUM' as const, dueDate: new Date('2026-06-01'), estimatedHours: 20 },
    { projectId: project2.id, title: 'Design mockups', status: 'COMPLETED' as const, priority: 'HIGH' as const, dueDate: new Date('2026-02-15'), estimatedHours: 30, actualHours: 28 },
    { projectId: project2.id, title: 'Frontend development', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, dueDate: new Date('2026-04-01'), estimatedHours: 100, actualHours: 45 },
    { projectId: project2.id, title: 'Content migration', status: 'TODO' as const, priority: 'MEDIUM' as const, dueDate: new Date('2026-04-15'), estimatedHours: 40 },
  ];

  for (const task of taskData) {
    await prisma.task.create({
      data: { ...task, assigneeId: admin.id },
    });
  }

  // ── Sample Invoices ──
  const customer = await prisma.customer.findFirst();
  if (customer) {
    await prisma.invoice.create({
      data: {
        number: 'INV-000001',
        type: 'SALES',
        status: 'PAID',
        customerId: customer.id,
        dueDate: new Date('2026-03-15'),
        subtotal: 5000,
        tax: 500,
        total: 5500,
        paidAmount: 5500,
        lines: {
          create: [
            { description: 'Consulting Services - February', quantity: 40, unitPrice: 125, total: 5000 },
          ],
        },
      },
    });

    await prisma.invoice.create({
      data: {
        number: 'INV-000002',
        type: 'SALES',
        status: 'SENT',
        customerId: customer.id,
        dueDate: new Date('2026-04-15'),
        subtotal: 12500,
        tax: 1250,
        total: 13750,
        lines: {
          create: [
            { description: 'Software Development - March', quantity: 80, unitPrice: 125, total: 10000 },
            { description: 'Project Management', quantity: 20, unitPrice: 125, total: 2500 },
          ],
        },
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log('📧 Admin login: admin@janus.dev / admin123');
  console.log('📧 Manager login: manager@janus.dev / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
