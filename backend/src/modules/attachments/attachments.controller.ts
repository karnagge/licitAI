import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * POST /attachments/upload
   * Upload a file attachment
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('projectId') projectId: string,
    @Query('messageId') messageId?: string,
  ) {
    const createDto: CreateAttachmentDto = {
      filename: file.originalname,
      mimeType: file.mimetype,
      storagePath: '', // Will be set by service
      projectId,
      messageId,
    };

    return this.attachmentsService.create(tenantId, userId, createDto, file);
  }

  /**
   * GET /attachments?projectId=xxx
   * Get all attachments for a project
   */
  @Get()
  findByProject(
    @Query('projectId') projectId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.attachmentsService.findByProject(projectId, tenantId);
  }

  /**
   * GET /attachments/:id
   * Get a single attachment
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.attachmentsService.findOne(id, tenantId);
  }

  /**
   * GET /attachments/:id/download
   * Download attachment file
   */
  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const attachment = await this.attachmentsService.findOne(id, tenantId);
    const fileBuffer = await this.attachmentsService.getFileBuffer(
      id,
      tenantId,
    );

    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${attachment.filename}"`,
    });

    return new StreamableFile(fileBuffer);
  }

  /**
   * DELETE /attachments/:id
   * Delete an attachment
   */
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.attachmentsService.remove(id, tenantId);
  }
}
