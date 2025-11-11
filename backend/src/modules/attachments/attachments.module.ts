import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { FileExtractionService } from './file-extraction.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiAgentsModule } from '../ai-agents/ai-agents.module';

@Module({
  imports: [PrismaModule, AiAgentsModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, FileExtractionService],
  exports: [AttachmentsService, FileExtractionService],
})
export class AttachmentsModule {}
