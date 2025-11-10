import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new document with initial version
   * @param tenantId - Organization ID
   * @param userId - User ID
   * @param createDto - Document data
   * @returns Created document with first version
   */
  async create(
    tenantId: string,
    userId: string,
    createDto: CreateDocumentDto,
  ) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: {
        id: createDto.projectId,
        tenantId,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found or access denied');
    }

    // Verify template exists
    const template = await this.prisma.template.findFirst({
      where: {
        id: createDto.templateId,
        OR: [{ isSystem: true }, { tenantId }],
      },
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // Create document with initial version in transaction
    return this.prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          title: createDto.title,
          tenantId,
          projectId: createDto.projectId,
          templateId: createDto.templateId,
          createdBy: userId,
          status: 'DRAFT',
          currentVersion: 1,
        },
      });

      // Create initial version
      await tx.documentVersion.create({
        data: {
          documentId: document.id,
          version: 1,
          content: '', // Empty content initially
          contentFormat: 'HTML',
          changeType: 'INITIAL',
          changeDescription: 'Initial document creation',
          createdBy: userId,
          wordCount: 0,
        },
      });

      // Increment template usage
      await tx.template.update({
        where: { id: createDto.templateId },
        data: { usageCount: { increment: 1 } },
      });

      return document;
    });
  }

  /**
   * Get all documents for a project
   * @param projectId - Project ID
   * @param tenantId - Organization ID
   * @returns List of documents
   */
  async findAllByProject(projectId: string, tenantId: string) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.document.findMany({
      where: {
        projectId,
        tenantId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get a single document by ID
   * @param id - Document ID
   * @param tenantId - Organization ID
   * @returns Document details
   */
  async findOne(id: string, tenantId: string) {
    const document = await this.prisma.document.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        template: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            creator: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Update document and create new version
   * @param id - Document ID
   * @param tenantId - Organization ID
   * @param userId - User ID
   * @param updateDto - Updated data
   * @returns Updated document
   */
  async update(
    id: string,
    tenantId: string,
    userId: string,
    updateDto: UpdateDocumentDto,
  ) {
    // Verify document exists and belongs to tenant
    const existingDoc = await this.findOne(id, tenantId);

    return this.prisma.$transaction(async (tx) => {
      // Update document
      const document = await tx.document.update({
        where: { id },
        data: {
          ...(updateDto.title && { title: updateDto.title }),
          ...(updateDto.status && { status: updateDto.status }),
          ...(updateDto.content && {
            currentVersion: { increment: 1 },
          }),
        },
      });

      // Create new version if content changed
      if (updateDto.content) {
        await tx.documentVersion.create({
          data: {
            documentId: id,
            version: document.currentVersion,
            content: updateDto.content,
            contentFormat: 'HTML',
            changeType: 'MANUAL_EDIT',
            createdBy: userId,
            wordCount: updateDto.content.split(/\s+/).length,
          },
        });
      }

      return document;
    });
  }

  /**
   * Get document versions
   * @param documentId - Document ID
   * @param tenantId - Organization ID
   * @returns List of versions
   */
  async getVersions(documentId: string, tenantId: string) {
    // Verify document belongs to tenant
    await this.findOne(documentId, tenantId);

    return this.prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { version: 'desc' },
    });
  }
}
