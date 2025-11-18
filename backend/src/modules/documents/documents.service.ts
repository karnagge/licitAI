import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ImproveTextDto } from './dto/improve-text.dto';
import { EmbeddingsService } from '../ai-agents/embeddings.service';
import { RefinementService } from '../ai-agents/refinement.service';
import PDFDocument from 'pdfkit';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';
import { Readable } from 'stream';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private prisma: PrismaService,
    private embeddings: EmbeddingsService,
    private refinement: RefinementService,
  ) {}

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

        // Trigger async embedding generation
        this.generateEmbeddingAsync(id, updateDto.content).catch((error) => {
          this.logger.error(`Failed to generate embedding for document ${id}`, error);
        });
      }

      return document;
    });
  }

  /**
   * Generate embedding for document content asynchronously
   * This runs in the background without blocking the response
   * @param documentId - Document ID
   * @param content - Document content
   */
  private async generateEmbeddingAsync(
    documentId: string,
    content: string,
  ): Promise<void> {
    try {
      this.logger.log(`Generating embedding for document ${documentId}`);

      // Generate embedding vector
      const embedding = await this.embeddings.generateEmbedding(content);

      // Update document with embedding
      await this.prisma.document.update({
        where: { id: documentId },
        data: { embedding } as any,
      });

      this.logger.log(`Embedding generated successfully for document ${documentId}`);
    } catch (error) {
      this.logger.error(`Embedding generation failed for document ${documentId}`, error);
      // Don't throw - this is async and should not fail the main operation
    }
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

  /**
   * Get a specific version of a document
   * @param documentId - Document ID
   * @param version - Version number
   * @param tenantId - Organization ID
   * @returns Specific version details
   */
  async findVersion(documentId: string, version: number, tenantId: string) {
    // Verify document belongs to tenant
    await this.findOne(documentId, tenantId);

    const documentVersion = await this.prisma.documentVersion.findFirst({
      where: {
        documentId,
        version,
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

    if (!documentVersion) {
      throw new NotFoundException(
        `Version ${version} not found for document ${documentId}`,
      );
    }

    return documentVersion;
  }

  /**
   * Rollback document to a previous version
   * Creates a new version with the content from the specified version
   * @param documentId - Document ID
   * @param targetVersion - Version to rollback to
   * @param tenantId - Organization ID
   * @param userId - User ID performing rollback
   * @returns Updated document
   */
  async rollback(
    documentId: string,
    targetVersion: number,
    tenantId: string,
    userId: string,
  ) {
    this.logger.log(
      `Rolling back document ${documentId} to version ${targetVersion}`,
    );

    // Verify document belongs to tenant
    const document = await this.findOne(documentId, tenantId);

    // Get target version to rollback to
    const targetVersionData = await this.findVersion(
      documentId,
      targetVersion,
      tenantId,
    );

    // Cannot rollback to current version
    if (targetVersion === document.currentVersion) {
      throw new BadRequestException(
        'Cannot rollback to current version',
      );
    }

    // Create new version with content from target version
    return this.prisma.$transaction(async (tx) => {
      const newVersionNumber = document.currentVersion + 1;

      // Update document
      const updatedDocument = await tx.document.update({
        where: { id: documentId },
        data: {
          currentVersion: newVersionNumber,
          updatedAt: new Date(),
        },
      });

      // Create new version with old content
      await tx.documentVersion.create({
        data: {
          documentId,
          version: newVersionNumber,
          content: targetVersionData.content,
          contentFormat: targetVersionData.contentFormat,
          changeType: 'ROLLBACK',
          changeDescription: `Rollback to version ${targetVersion}`,
          createdBy: userId,
          wordCount: targetVersionData.wordCount,
        },
      });

      this.logger.log(
        `Document ${documentId} rolled back to version ${targetVersion} (new version ${newVersionNumber})`,
      );

      return updatedDocument;
    });
  }

  /**
   * Improve selected text using AI
   * @param documentId - Document ID
   * @param tenantId - Organization ID
   * @param improveTextDto - Selected text and context
   * @returns Improved text suggestion
   */
  async improveText(
    documentId: string,
    tenantId: string,
    improveTextDto: ImproveTextDto,
  ): Promise<{ suggestion: string }> {
    // Verify document belongs to tenant
    await this.findOne(documentId, tenantId);

    this.logger.log(`Improving text for document ${documentId}`);

    // Use refinement service to improve text
    const suggestion = await this.refinement.refineText(
      improveTextDto.selectedText,
      improveTextDto.context,
      improveTextDto.instruction,
    );

    return { suggestion };
  }

  /**
   * Export document to PDF
   * @param documentId - Document ID
   * @param tenantId - Organization ID
   * @returns PDF buffer as stream
   */
  async exportToPDF(documentId: string, tenantId: string): Promise<Readable> {
    this.logger.log(`Exporting document ${documentId} to PDF`);

    // Get document with latest version
    const document = await this.findOne(documentId, tenantId);
    const latestVersion = document.versions[0];

    if (!latestVersion || !latestVersion.content) {
      throw new BadRequestException('Document has no content to export');
    }

    // Create PDF document
    const pdf = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: document.title,
        Author: 'licitAI Platform',
        Subject: `${document.template.name}`,
        CreationDate: new Date(),
      },
    });

    // Convert HTML content to plain text (simple conversion)
    // For production, consider using a proper HTML-to-PDF library
    const plainText = this.htmlToPlainText(latestVersion.content);

    // Add title
    pdf.fontSize(18).font('Helvetica-Bold').text(document.title, {
      align: 'center',
    });

    pdf.moveDown();

    // Add metadata
    pdf
      .fontSize(10)
      .font('Helvetica')
      .text(`Template: ${document.template.name}`, { align: 'left' });
    pdf.text(`Versão: ${latestVersion.version}`, { align: 'left' });
    pdf.text(
      `Data: ${latestVersion.createdAt.toLocaleDateString('pt-BR')}`,
      { align: 'left' },
    );

    pdf.moveDown(2);

    // Add content
    pdf.fontSize(11).font('Helvetica').text(plainText, {
      align: 'justify',
      lineGap: 2,
    });

    // Finalize PDF
    pdf.end();

    this.logger.log(`PDF export completed for document ${documentId}`);

    return pdf as unknown as Readable;
  }

  /**
   * Export document to DOCX
   * @param documentId - Document ID
   * @param tenantId - Organization ID
   * @returns DOCX buffer
   */
  async exportToDOCX(documentId: string, tenantId: string): Promise<Buffer> {
    this.logger.log(`Exporting document ${documentId} to DOCX`);

    // Get document with latest version
    const document = await this.findOne(documentId, tenantId);
    const latestVersion = document.versions[0];

    if (!latestVersion || !latestVersion.content) {
      throw new BadRequestException('Document has no content to export');
    }

    // Convert HTML to paragraphs (simple conversion)
    const plainText = this.htmlToPlainText(latestVersion.content);
    const paragraphs = plainText.split('\n\n').filter((p) => p.trim());

    // Create DOCX document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: document.title,
              heading: HeadingLevel.TITLE,
              spacing: { after: 200 },
            }),
            // Metadata
            new Paragraph({
              children: [
                new TextRun({
                  text: `Template: ${document.template.name}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Versão: ${latestVersion.version}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Data: ${latestVersion.createdAt.toLocaleDateString('pt-BR')}`,
                  size: 20,
                }),
              ],
              spacing: { after: 400 },
            }),
            // Content paragraphs
            ...paragraphs.map(
              (text) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: text.trim(),
                      size: 24,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
            ),
          ],
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    this.logger.log(`DOCX export completed for document ${documentId}`);

    return buffer;
  }

  /**
   * Simple HTML to plain text conversion
   * For production, use a proper HTML parser
   * @param html - HTML content
   * @returns Plain text
   */
  private htmlToPlainText(html: string): string {
    return (
      html
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }
}
