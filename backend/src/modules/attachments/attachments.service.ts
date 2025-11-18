import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { FileExtractionService } from './file-extraction.service';
import { EmbeddingsService } from '../ai-agents/embeddings.service';
import { AttachmentStatus } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor(
    private prisma: PrismaService,
    private fileExtraction: FileExtractionService,
    private embeddings: EmbeddingsService,
  ) {}

  /**
   * Create attachment record and process file
   * @param tenantId - Organization ID
   * @param userId - User ID
   * @param createDto - Attachment data
   * @param file - Uploaded file buffer
   * @returns Created attachment
   */
  async create(
    tenantId: string,
    userId: string,
    createDto: CreateAttachmentDto,
    file: Express.Multer.File,
  ) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: {
        id: createDto.projectId,
        tenantId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }

    // Validate file type
    if (!this.fileExtraction.isSupportedMimeType(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported types: TXT, PDF, DOCX, XLSX`,
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is 10MB, received ${Math.round(file.size / 1024 / 1024)}MB`,
      );
    }

    // Generate storage path
    const storagePath = await this.saveFile(file, tenantId, createDto.projectId);

    // Create attachment record
    const attachment = await this.prisma.attachment.create({
      data: {
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath,
        projectId: createDto.projectId,
        messageId: createDto.messageId,
        tenantId,
        createdBy: userId,
        status: AttachmentStatus.READY,
      },
    });

    // Process file asynchronously (extract text + generate embedding)
    this.processFileAsync(attachment.id, storagePath, file.mimetype).catch(
      (error) => {
        this.logger.error(
          `Failed to process attachment ${attachment.id}`,
          error,
        );
      },
    );

    return attachment;
  }

  /**
   * Save file to disk
   */
  private async saveFile(
    file: Express.Multer.File,
    tenantId: string,
    projectId: string,
  ): Promise<string> {
    // Create directory structure: uploads/{tenantId}/{projectId}
    const dir = path.join(this.uploadDir, tenantId, projectId);
    await fs.mkdir(dir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = this.fileExtraction.getExtensionFromMimeType(file.mimetype);
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = path.join(dir, filename);

    // Write file
    await fs.writeFile(filePath, file.buffer);

    return filePath;
  }

  /**
   * Process file: extract text and generate embedding
   */
  private async processFileAsync(
    attachmentId: string,
    storagePath: string,
    mimeType: string,
  ): Promise<void> {
    try {
      this.logger.log(`Processing attachment ${attachmentId}`);

      // Update status to processing
      await this.prisma.attachment.update({
        where: { id: attachmentId },
        data: { status: AttachmentStatus.PROCESSING },
      });

      // Extract text
      const extractedText = await this.fileExtraction.extractText(
        storagePath,
        mimeType,
      );

      // Generate embedding
      let embedding = null;
      if (extractedText && extractedText.length > 0) {
        embedding = await this.embeddings.generateEmbedding(extractedText);
      }

      // Update attachment with extracted text and embedding
      const updateData: any = {
        extractedText,
        status: AttachmentStatus.READY,
        processedAt: new Date(),
      };
      
      if (embedding) {
        updateData.embedding = embedding;
      }

      await this.prisma.attachment.update({
        where: { id: attachmentId },
        data: updateData,
      });

      this.logger.log(`Successfully processed attachment ${attachmentId}`);
    } catch (error) {
      this.logger.error(`Processing failed for attachment ${attachmentId}`, error);

      // Update status to error
      await this.prisma.attachment.update({
        where: { id: attachmentId },
        data: { status: AttachmentStatus.ERROR },
      });
    }
  }

  /**
   * Get attachments for a project
   */
  async findByProject(projectId: string, tenantId: string) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.attachment.findMany({
      where: {
        projectId,
        tenantId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get attachments for a message
   */
  async findByMessage(messageId: string, tenantId: string) {
    return this.prisma.attachment.findMany({
      where: {
        messageId,
        tenantId,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get a single attachment
   */
  async findOne(id: string, tenantId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  /**
   * Download attachment file
   */
  async getFileBuffer(id: string, tenantId: string): Promise<Buffer> {
    const attachment = await this.findOne(id, tenantId);

    try {
      return await fs.readFile(attachment.storagePath);
    } catch (error) {
      this.logger.error(`Failed to read file ${attachment.storagePath}`, error);
      throw new NotFoundException('File not found on disk');
    }
  }

  /**
   * Delete attachment
   */
  async remove(id: string, tenantId: string) {
    const attachment = await this.findOne(id, tenantId);

    // Delete file from disk
    try {
      await fs.unlink(attachment.storagePath);
    } catch (error) {
      this.logger.warn(
        `Failed to delete file ${attachment.storagePath}`,
        error,
      );
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    return this.prisma.attachment.delete({
      where: { id },
    });
  }
}
