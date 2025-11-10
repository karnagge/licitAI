import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { ResearcherService } from './researcher.service';
import { ValidatorService } from './validator.service';
import { WriterService } from './writer.service';
import { ReviewerService } from './reviewer.service';
import { OrchestrationService } from './orchestration.service';

/**
 * AI Agents Module
 *
 * Provides specialized AI agents for document generation:
 * - Researcher: Gathers legal info and best practices
 * - Writer: Generates document content
 * - Validator: Checks legal compliance
 * - Reviewer: Final quality review
 * - Orchestration: Coordinates all agents
 *
 * All agents use Anthropic's Claude for natural language understanding
 * and generation.
 */
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    ResearcherService,
    ValidatorService,
    WriterService,
    ReviewerService,
    OrchestrationService,
  ],
  exports: [
    ResearcherService,
    ValidatorService,
    WriterService,
    ReviewerService,
    OrchestrationService,
  ],
})
export class AiAgentsModule {}
