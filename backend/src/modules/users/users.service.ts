import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Invite a new user to the organization
   * Creates user with temporary password and sends invitation email
   * @param tenantId - Organization ID
   * @param invitedBy - User ID who is inviting
   * @param inviteDto - Invitation data
   * @returns Created user
   */
  async inviteUser(
    tenantId: string,
    invitedBy: string,
    inviteDto: InviteUserDto,
  ) {
    this.logger.log(
      `Inviting user ${inviteDto.email} to organization ${tenantId}`,
    );

    // Check if user already exists in this organization
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: inviteDto.email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this email already exists in your organization',
      );
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: inviteDto.email,
        fullName: inviteDto.fullName,
        passwordHash: hashedPassword,
        role: inviteDto.role,
        tenantId,
        emailVerified: false, // User needs to verify email/set password
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    // TODO: Send invitation email with temp password or setup link
    // For MVP, we'll log the temp password (in production, send email)
    this.logger.log(
      `User invited successfully. Temporary password: ${tempPassword}`,
    );
    this.logger.warn(
      'Email sending not implemented - in production, send invitation email',
    );

    return {
      ...user,
      tempPassword, // Only for MVP - remove in production
    };
  }

  /**
   * Get all users in an organization
   * @param tenantId - Organization ID
   * @returns List of users
   */
  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        lastLoginAt: true,
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a single user
   * @param userId - User ID
   * @param tenantId - Organization ID
   * @returns User details
   */
  async findOne(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user's role
   * Only admins can update roles
   * Cannot change own role or remove last admin
   * @param userId - User ID to update
   * @param tenantId - Organization ID
   * @param currentUserId - User ID making the change
   * @param updateDto - New role
   * @returns Updated user
   */
  async updateRole(
    userId: string,
    tenantId: string,
    currentUserId: string,
    updateDto: UpdateUserRoleDto,
  ) {
    // Cannot change own role
    if (userId === currentUserId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // Verify user exists and belongs to same organization
    const user = await this.findOne(userId, tenantId);

    // If removing admin role, check if there's at least one other admin
    if (user.role === UserRole.ADMIN && updateDto.role !== UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: {
          tenantId,
          role: UserRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last admin. Organization must have at least one admin.',
        );
      }
    }

    // Update role
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: updateDto.role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        lastLoginAt: true,
      },
    });
  }

  /**
   * Remove user from organization
   * Only admins can remove users
   * Cannot remove self or last admin
   * @param userId - User ID to remove
   * @param tenantId - Organization ID
   * @param currentUserId - User ID making the change
   */
  async remove(userId: string, tenantId: string, currentUserId: string) {
    // Cannot remove self
    if (userId === currentUserId) {
      throw new ForbiddenException('You cannot remove yourself');
    }

    // Verify user exists and belongs to same organization
    const user = await this.findOne(userId, tenantId);

    // Cannot remove last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: {
          tenantId,
          role: UserRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last admin. Organization must have at least one admin.',
        );
      }
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.log(`User ${userId} removed from organization ${tenantId}`);

    return { success: true, message: 'User removed successfully' };
  }
}
