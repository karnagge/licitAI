import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * POST /organizations
   * Create a new organization (public endpoint used during registration)
   */
  @Public()
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  /**
   * GET /organizations/me
   * Get current user's organization
   */
  @Get('me')
  findMine(@CurrentTenant() tenantId: string) {
    return this.organizationsService.findByTenantId(tenantId);
  }
}
