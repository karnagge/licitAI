import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * POST /projects
   * Create a new project
   */
  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(tenantId, userId, createProjectDto);
  }

  /**
   * GET /projects
   * Get all projects for current tenant
   */
  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.projectsService.findAll(
      tenantId,
      page ? parseInt(page) : undefined,
      pageSize ? parseInt(pageSize) : undefined,
    );
  }

  /**
   * GET /projects/:id
   * Get a single project by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.projectsService.findOne(id, tenantId);
  }

  /**
   * PATCH /projects/:id
   * Update a project
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, tenantId, updateProjectDto);
  }

  /**
   * DELETE /projects/:id
   * Archive a project (soft delete)
   */
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.projectsService.remove(id, tenantId);
  }
}
