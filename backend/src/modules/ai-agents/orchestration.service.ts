import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResearcherService } from './researcher.service';
import { ValidatorService, ValidationResult } from './validator.service';
import { WriterService, WriterContext } from './writer.service';
import { ReviewerService, ReviewFeedback } from './reviewer.service';

export interface OrchestrationResult {
  documentId: string;
  versionId: string;
  content: string;
  research: {
    findings: string;
    legalReferences: string[];
    recommendations: string[];
  };
  validation: ValidationResult;
  review: ReviewFeedback;
  metadata: {
    generatedAt: Date;
    agentVersions: string[];
    processingTimeMs: number;
  };
}

export interface GenerationProgress {
  stage: 'researching' | 'writing' | 'validating' | 'reviewing' | 'complete';
  message: string;
  progress: number; // 0-100
}

/**
 * Agent Orchestration Service
 * Coordinates the specialized agents to work together in generating
 * high-quality, compliant procurement documents.
 *
 * Workflow:
 * 1. Researcher: Gather relevant legal info and best practices
 * 2. Writer: Generate initial document based on research
 * 3. Validator: Check legal compliance and completeness
 * 4. Reviewer: Final quality review
 * 5. (Optional) Writer: Refine based on feedback
 */
@Injectable()
export class OrchestrationService {
  private readonly logger = new Logger(OrchestrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly researcher: ResearcherService,
    private readonly validator: ValidatorService,
    private readonly writer: WriterService,
    private readonly reviewer: ReviewerService,
  ) {}

  /**
   * Generate a document through the full agent pipeline
   * @param documentId - Document entity ID
   * @param userMessage - User's requirements/message
   * @param onProgress - Callback for progress updates
   * @returns Complete orchestration result
   */
  async generateDocument(
    documentId: string,
    userMessage: string,
    onProgress?: (progress: GenerationProgress) => void,
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    this.logger.log(`Starting document generation for: ${documentId}`);

    try {
      // Fetch document and template information
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: {
          template: true,
          project: true,
        },
      });

      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      const template = {
        name: document.template.name,
        sections: document.template.sections as any[],
      };

      // Stage 1: Research
      onProgress?.({
        stage: 'researching',
        message: 'Pesquisando informações legais e melhores práticas...',
        progress: 10,
      });

      const research = await this.researcher.research(userMessage, template);

      // Stage 2: Write
      onProgress?.({
        stage: 'writing',
        message: 'Gerando conteúdo do documento...',
        progress: 40,
      });

      const writerContext: WriterContext = {
        userRequirements: userMessage,
        researchFindings: research.findings,
        template,
        documentType: document.template.type,
      };

      let content = await this.writer.write(writerContext);

      // Stage 3: Validate
      onProgress?.({
        stage: 'validating',
        message: 'Validando conformidade legal...',
        progress: 70,
      });

      const validation = await this.validator.validate(
        content,
        template,
        document.template.type,
      );

      // If validation finds critical issues, attempt one refinement
      if (validation.score < 70) {
        this.logger.warn(
          `Validation score low (${validation.score}), attempting refinement`,
        );

        const criticalIssues = validation.issues
          .filter((i) => i.severity === 'critical')
          .map((i) => `${i.section}: ${i.issue} - ${i.suggestion}`)
          .join('\n');

        if (criticalIssues) {
          onProgress?.({
            stage: 'writing',
            message: 'Refinando documento baseado em validação...',
            progress: 75,
          });

          // Re-generate with validation feedback
          const refinedContext: WriterContext = {
            ...writerContext,
            researchFindings: `${research.findings}\n\nVALIDATION FEEDBACK:\n${criticalIssues}`,
          };

          content = await this.writer.write(refinedContext);
        }
      }

      // Stage 4: Review
      onProgress?.({
        stage: 'reviewing',
        message: 'Realizando revisão final de qualidade...',
        progress: 90,
      });

      const review = await this.reviewer.review(
        content,
        template,
        document.template.type,
      );

      // Calculate word count
      const wordCount = content.split(/\s+/).length;

      // Save document version
      const newVersion = document.currentVersion + 1;
      const documentVersion = await this.prisma.documentVersion.create({
        data: {
          documentId: document.id,
          version: newVersion,
          content,
          contentFormat: 'HTML',
          changeType: 'AI_GENERATED',
          createdBy: document.createdBy,
          wordCount,
          metadata: {
            research,
            validation,
            review,
          } as any,
        },
      });

      // Update document
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          currentVersion: newVersion,
          status: review.readinessLevel === 'ready' ? ('COMPLETED' as any) : ('DRAFT' as any),
        },
      });

      onProgress?.({
        stage: 'complete',
        message: 'Documento gerado com sucesso!',
        progress: 100,
      });

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Document generation completed in ${processingTime}ms. Quality: ${review.overallQuality}/100`,
      );

      return {
        documentId: document.id,
        versionId: documentVersion.id,
        content,
        research,
        validation,
        review,
        metadata: {
          generatedAt: new Date(),
          agentVersions: ['researcher-v1', 'writer-v1', 'validator-v1', 'reviewer-v1'],
          processingTimeMs: processingTime,
        },
      };
    } catch (error) {
      this.logger.error('Document generation failed', error);
      throw error;
    }
  }

  /**
   * Generate document with SSE streaming
   * Yields progress updates and content chunks in real-time
   */
  async *generateDocumentStream(
    documentId: string,
    userMessage: string,
  ): AsyncGenerator<{ type: string; data: any }> {
    const startTime = Date.now();
    this.logger.log(`Starting streaming generation for: ${documentId}`);

    try {
      // Fetch document info
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: { template: true, project: true },
      });

      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      const template = {
        name: document.template.name,
        sections: document.template.sections as any[],
      };

      // Stage 1: Research
      yield {
        type: 'progress',
        data: {
          stage: 'researching',
          message: 'Pesquisando informações legais...',
          progress: 10,
        },
      };

      const research = await this.researcher.research(userMessage, template);

      yield {
        type: 'research',
        data: {
          findings: research.findings,
          legalReferences: research.legalReferences,
        },
      };

      // Stage 2: Write with streaming
      yield {
        type: 'progress',
        data: {
          stage: 'writing',
          message: 'Gerando documento...',
          progress: 30,
        },
      };

      const writerContext: WriterContext = {
        userRequirements: userMessage,
        researchFindings: research.findings,
        template,
        documentType: document.template.type,
      };

      let fullContent = '';
      for await (const chunk of this.writer.writeStream(writerContext)) {
        fullContent += chunk;
        yield {
          type: 'content',
          data: { chunk },
        };
      }

      // Stage 3: Validate
      yield {
        type: 'progress',
        data: {
          stage: 'validating',
          message: 'Validando documento...',
          progress: 80,
        },
      };

      const validation = await this.validator.validate(
        fullContent,
        template,
        document.template.type,
      );

      yield {
        type: 'validation',
        data: validation,
      };

      // Stage 4: Review
      yield {
        type: 'progress',
        data: {
          stage: 'reviewing',
          message: 'Revisão final...',
          progress: 90,
        },
      };

      const review = await this.reviewer.review(
        fullContent,
        template,
        document.template.type,
      );

      yield {
        type: 'review',
        data: review,
      };

      // Save version
      const wordCount = fullContent.split(/\s+/).length;
      const newVersion = document.currentVersion + 1;

      const documentVersion = await this.prisma.documentVersion.create({
        data: {
          documentId: document.id,
          version: newVersion,
          content: fullContent,
          contentFormat: 'HTML',
          changeType: 'AI_GENERATED',
          createdBy: document.createdBy,
          wordCount,
          metadata: { research, validation, review } as any,
        },
      });

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          currentVersion: newVersion,
          status: review.readinessLevel === 'ready' ? ('COMPLETED' as any) : ('DRAFT' as any),
        },
      });

      yield {
        type: 'complete',
        data: {
          documentId: document.id,
          versionId: documentVersion.id,
          processingTimeMs: Date.now() - startTime,
        },
      };
    } catch (error) {
      this.logger.error('Streaming generation failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      yield {
        type: 'error',
        data: { message: errorMessage },
      };
      throw error;
    }
  }

  /**
   * Handle conversational message in existing chat
   * Determines intent and routes to appropriate handler
   */
  async handleChatMessage(
    chatId: string,
    message: string,
  ): Promise<{ response: string; intent: string }> {
    // Simple intent classification
    // In production, this could use a classifier model

    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('gerar') ||
      lowerMessage.includes('criar documento') ||
      lowerMessage.includes('começar')
    ) {
      return {
        intent: 'generate_document',
        response:
          'Entendido! Vou iniciar a geração do documento. Por favor, forneça mais detalhes sobre: tipo de licitação, objeto do contrato, e quaisquer requisitos específicos.',
      };
    }

    if (
      lowerMessage.includes('melhorar') ||
      lowerMessage.includes('refinar') ||
      lowerMessage.includes('ajustar')
    ) {
      return {
        intent: 'refine_section',
        response:
          'Claro! Qual seção você gostaria de melhorar? Por favor, especifique a seção e o que você gostaria de alterar.',
      };
    }

    // Default: conversational response
    return {
      intent: 'conversation',
      response:
        'Entendi. Estou aqui para ajudá-lo a criar documentos de licitação. Você pode me pedir para gerar um documento, refinar seções específicas, ou tirar dúvidas sobre o processo.',
    };
  }
}
