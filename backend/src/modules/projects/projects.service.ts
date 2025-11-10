import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new project with tenant isolation
   * @param tenantId - Organization ID from JWT
   * @param userId - User ID from JWT
   * @param createDto - Project data
   * @returns Created project
   */
  async create(tenantId: string, userId: string, createDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createDto,
        tenantId,
        createdBy: userId,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Get all projects for a tenant with pagination
   * @param tenantId - Organization ID from JWT
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20)
   * @returns Paginated projects
   */
  async findAll(tenantId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { tenantId },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              documents: true,
              chats: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.project.count({ where: { tenantId } }),
    ]);

    return {
      data: projects,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single project by ID with tenant isolation
   * @param id - Project ID
   * @param tenantId - Organization ID from JWT
   * @returns Project details
   */
  async findOne(id: string, tenantId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        tenantId, // Tenant isolation
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        documents: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
        chats: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Update a project with tenant isolation
   * @param id - Project ID
   * @param tenantId - Organization ID from JWT
   * @param updateDto - Updated project data
   * @returns Updated project
   */
  async update(id: string, tenantId: string, updateDto: UpdateProjectDto) {
    // Verify project exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.project.update({
      where: { id },
      data: updateDto,
    });
  }

  /**
   * Delete a project (soft delete by archiving)
   * @param id - Project ID
   * @param tenantId - Organization ID from JWT
   */
  async remove(id: string, tenantId: string) {
    // Verify project exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}
