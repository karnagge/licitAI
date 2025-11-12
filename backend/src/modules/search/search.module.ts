import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiAgentsModule } from '../ai-agents/ai-agents.module';

@Module({
  imports: [PrismaModule, AiAgentsModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
