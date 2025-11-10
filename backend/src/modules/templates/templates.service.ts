import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplateType } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a custom template for a tenant
   * @param tenantId - Organization ID
   * @param userId - User ID who created the template
   * @param createDto - Template data
   * @returns Created template
   */
  async create(
    tenantId: string,
    userId: string,
    createDto: CreateTemplateDto,
  ) {
    return this.prisma.template.create({
      data: {
        ...createDto,
        tenantId,
        createdBy: userId,
        isSystem: false,
      },
    });
  }

  /**
   * Get all templates (system + tenant custom templates)
   * @param tenantId - Organization ID
   * @param type - Optional filter by template type
   * @returns List of templates
   */
  async findAll(tenantId: string, type?: TemplateType) {
    const where = {
      OR: [
        { isSystem: true }, // System templates available to all
        { tenantId }, // Custom templates for this tenant
      ],
      ...(type && { type }),
    };

    return this.prisma.template.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        isSystem: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
        sections: true,
      },
    });
  }

  /**
   * Get a single template by ID
   * @param id - Template ID
   * @param tenantId - Organization ID
   * @returns Template details with sections
   */
  async findOne(id: string, tenantId: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        id,
        OR: [
          { isSystem: true }, // System templates
          { tenantId }, // Custom templates
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Increment usage count when template is used
   * @param id - Template ID
   */
  async incrementUsageCount(id: string) {
    return this.prisma.template.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }
}
