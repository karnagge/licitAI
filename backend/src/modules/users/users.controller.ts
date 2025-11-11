import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users/invite
   * Invite a new user to the organization (Admin/Manager only)
   */
  @Post('invite')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  inviteUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() inviteDto: InviteUserDto,
  ) {
    return this.usersService.inviteUser(tenantId, userId, inviteDto);
  }

  /**
   * GET /users
   * Get all users in the organization
   */
  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.usersService.findAll(tenantId);
  }

  /**
   * GET /users/:id
   * Get a single user
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  /**
   * PATCH /users/:id/role
   * Update user's role (Admin only)
   */
  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(
    @Param('id') userId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') currentUserId: string,
    @Body() updateDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(
      userId,
      tenantId,
      currentUserId,
      updateDto,
    );
  }

  /**
   * DELETE /users/:id
   * Remove user from organization (Admin only)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id') userId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    return this.usersService.remove(userId, tenantId, currentUserId);
  }
}
