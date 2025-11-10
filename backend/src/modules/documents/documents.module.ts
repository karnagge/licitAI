import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiAgentsModule } from '../ai-agents/ai-agents.module';

@Module({
  imports: [PrismaModule, AiAgentsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
