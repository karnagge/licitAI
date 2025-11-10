import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new organization
   * @param createDto - Organization data
   * @returns Created organization
   */
  async create(createDto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        ...createDto,
        status: 'TRIAL',
      },
    });
  }

  /**
   * Get organization by ID
   * @param id - Organization ID
   * @returns Organization details
   */
  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
            documents: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  /**
   * Get organization by tenant ID (used by authenticated users)
   * @param tenantId - Tenant ID from JWT
   * @returns Organization details
   */
  async findByTenantId(tenantId: string) {
    return this.findOne(tenantId);
  }
}
