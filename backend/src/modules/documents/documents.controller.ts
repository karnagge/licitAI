import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ImproveTextDto } from './dto/improve-text.dto';
import { RollbackDocumentDto } from './dto/rollback-document.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /documents
   * Create a new document
   */
  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create(tenantId, userId, createDocumentDto);
  }

  /**
   * GET /documents?projectId=xxx
   * Get all documents for a project
   */
  @Get()
  findAll(
    @Query('projectId') projectId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.documentsService.findAllByProject(projectId, tenantId);
  }

  /**
   * GET /documents/:id
   * Get a single document
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.documentsService.findOne(id, tenantId);
  }

  /**
   * PATCH /documents/:id
   * Update a document (creates new version if content changes)
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(
      id,
      tenantId,
      userId,
      updateDocumentDto,
    );
  }

  /**
   * GET /documents/:id/versions
   * Get all versions of a document
   */
  @Get(':id/versions')
  getVersions(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.documentsService.getVersions(id, tenantId);
  }

  /**
   * GET /documents/:id/versions/:version
   * Get a specific version of a document
   */
  @Get(':id/versions/:version')
  getVersion(
    @Param('id') id: string,
    @Param('version') version: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.documentsService.findVersion(id, parseInt(version, 10), tenantId);
  }

  /**
   * POST /documents/:id/rollback
   * Rollback document to a specific version (creates new version)
   */
  @Post(':id/rollback')
  rollback(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() rollbackDto: RollbackDocumentDto,
  ) {
    return this.documentsService.rollback(id, rollbackDto.version, tenantId, userId);
  }

  /**
   * POST /documents/:id/improve
   * Improve selected text using AI
   */
  @Post(':id/improve')
  improveText(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() improveTextDto: ImproveTextDto,
  ) {
    return this.documentsService.improveText(id, tenantId, improveTextDto);
  }

  /**
   * GET /documents/:id/export/pdf
   * Export document to PDF
   */
  @Get(':id/export/pdf')
  async exportPDF(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfStream = await this.documentsService.exportToPDF(id, tenantId);

    // Get document to set filename
    const document = await this.documentsService.findOne(id, tenantId);
    const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(pdfStream);
  }

  /**
   * GET /documents/:id/export/docx
   * Export document to DOCX
   */
  @Get(':id/export/docx')
  async exportDOCX(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const docxBuffer = await this.documentsService.exportToDOCX(id, tenantId);

    // Get document to set filename
    const document = await this.documentsService.findOne(id, tenantId);
    const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}.docx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(docxBuffer);
  }
}
