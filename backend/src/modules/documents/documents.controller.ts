import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
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
}
