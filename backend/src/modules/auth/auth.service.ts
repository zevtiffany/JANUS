import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';

export class AuthService {
  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    let defaultRole = await prisma.role.findUnique({ where: { name: 'Employee' } });
    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: { name: 'Employee', description: 'Default employee role' },
      });
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: defaultRole.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: { select: { name: true } },
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user.id, user.role.name);

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.role.name);

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, ...tokens };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        role: { select: { id: true, name: true } },
        employee: { select: { id: true, employeeCode: true, position: true, department: { select: { name: true } } } },
        createdAt: true,
      },
    });

    if (!user) throw new Error('User not found');
    return user;
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; role: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: { select: { name: true } } },
      });

      if (!user || !user.isActive) throw new Error('Invalid refresh token');

      return this.generateTokens(user.id, user.role.name);
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }
}
