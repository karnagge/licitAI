import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateFromDocumentDto } from './dto/create-from-document.dto';
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

  /**
   * Create a template from an existing document
   * Extracts structure (headings) from document content
   * @param tenantId - Organization ID
   * @param userId - User ID creating the template
   * @param createDto - Document ID and template info
   * @returns Created template
   */
  async createFromDocument(
    tenantId: string,
    userId: string,
    createDto: CreateFromDocumentDto,
  ) {
    // Verify document exists and belongs to tenant
    const document = await this.prisma.document.findFirst({
      where: {
        id: createDto.documentId,
        tenantId,
      },
      include: {
        template: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found or access denied');
    }

    const latestVersion = document.versions[0];
    if (!latestVersion || !latestVersion.content) {
      throw new BadRequestException('Document has no content to extract structure from');
    }

    // Extract headings from HTML content
    const sections = this.extractSectionsFromContent(latestVersion.content);

    if (sections.length === 0) {
      throw new BadRequestException(
        'No sections found in document. Document must have headings (h1, h2, h3) to create template.',
      );
    }

    // Create template
    return this.prisma.template.create({
      data: {
        name: createDto.name,
        description: createDto.description || `Template created from ${document.title}`,
        type: document.template.type, // Inherit type from source document
        sections,
        tenantId,
        createdBy: userId,
        isSystem: false,
      },
    });
  }

  /**
   * Extract section structure from HTML content
   * Looks for h1, h2, h3 tags to identify sections
   * @param content - HTML content
   * @returns Array of section objects
   */
  private extractSectionsFromContent(content: string): any[] {
    const sections: any[] = [];

    // Simple regex to extract headings (h1, h2, h3)
    const headingRegex = /<h([123])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    let order = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1], 10);
      const title = match[2]
        .replace(/<[^>]+>/g, '') // Remove any nested HTML tags
        .trim();

      if (title) {
        sections.push({
          title,
          description: `Section from document (heading level ${level})`,
          order: order++,
          required: level === 1, // H1 headings are required
          guidelines: '',
        });
      }
    }

    return sections;
  }
}
