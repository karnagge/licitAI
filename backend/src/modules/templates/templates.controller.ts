import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TemplateType } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * POST /templates
   * Create a custom template (Admin/Manager only)
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, userId, createTemplateDto);
  }

  /**
   * GET /templates
   * Get all available templates (system + custom)
   * Optional filter by type: ?type=ETP
   */
  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: TemplateType,
  ) {
    return this.templatesService.findAll(tenantId, type);
  }

  /**
   * GET /templates/:id
   * Get a single template by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.templatesService.findOne(id, tenantId);
  }
}
