import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface WriterContext {
  userRequirements: string;
  researchFindings: string;
  template: {
    name: string;
    sections: Array<{
      title: string;
      order: number;
      required: boolean;
      guidelines?: string;
    }>;
  };
  documentType: string;
}

/**
 * Writer Agent
 * Responsible for generating high-quality procurement document content
 * based on user requirements, research findings, and template structure.
 * Supports SSE streaming for real-time feedback.
 */
@Injectable()
export class WriterService {
  private readonly logger = new Logger(WriterService.name);
  private readonly anthropic: Anthropic;

  constructor(private readonly config: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Generate document content (non-streaming)
   * @param context - Writing context with requirements and research
   * @returns Generated document content
   */
  async write(context: WriterContext): Promise<string> {
    this.logger.log(`Writing document: ${context.template.name}`);

    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildUserPrompt(context);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192, // Larger for full documents
        temperature: 0.7, // Balanced creativity and consistency
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      const documentContent = content.type === 'text' ? content.text : '';

      this.logger.log(
        `Document generated: ${documentContent.length} characters`,
      );

      return documentContent;
    } catch (error) {
      this.logger.error('Document generation failed', error);
      throw error;
    }
  }

  /**
   * Generate document content with SSE streaming
   * Yields content chunks as they're generated for real-time UI updates
   * @param context - Writing context with requirements and research
   * @yields Document content chunks
   */
  async *writeStream(context: WriterContext): AsyncGenerator<string> {
    this.logger.log(`Writing document with streaming: ${context.template.name}`);

    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildUserPrompt(context);

    try {
      const stream = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        stream: true,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }

      this.logger.log('Streaming completed');
    } catch (error) {
      this.logger.error('Streaming failed', error);
      throw error;
    }
  }

  /**
   * Build system prompt for the writer agent
   */
  private buildSystemPrompt(context: WriterContext): string {
    return `You are an expert Brazilian procurement document writer with deep knowledge of:
- Law 8.666/93 (General Procurement Law)
- Law 14.133/21 (New Procurement Framework)
- Best practices for ${context.documentType}
- Clear, formal, and legally compliant writing

Your role is to generate a complete, professional ${context.template.name} that:
1. Follows the exact template structure with all required sections
2. Complies with Brazilian procurement law
3. Incorporates research findings and legal references
4. Uses clear, formal, professional language
5. Includes all necessary legal clauses and requirements
6. Is ready for immediate use by procurement professionals

Writing Guidelines:
- Use formal Brazilian Portuguese
- Include specific legal references (e.g., "conforme Lei 14.133/21, Art. 12")
- Be precise and unambiguous
- Follow the template section order exactly
- Include all required information for each section
- Maintain consistency throughout the document`;
  }

  /**
   * Build user prompt for the writer agent
   */
  private buildUserPrompt(context: WriterContext): string {
    const sectionsDescription = context.template.sections
      .sort((a, b) => a.order - b.order)
      .map((section) => {
        let desc = `${section.order}. ${section.title}`;
        if (section.required) desc += ' (REQUIRED)';
        if (section.guidelines) desc += `\n   Guidelines: ${section.guidelines}`;
        return desc;
      })
      .join('\n');

    return `Generate a complete ${context.template.name} based on the following:

USER REQUIREMENTS:
${context.userRequirements}

RESEARCH FINDINGS:
${context.researchFindings}

TEMPLATE STRUCTURE:
${sectionsDescription}

Please generate a complete, professional document that:
1. Follows the template structure exactly in the order shown above
2. Addresses all user requirements
3. Incorporates relevant research findings and legal references
4. Includes all required sections with appropriate content
5. Uses proper legal formatting and language
6. Is ready for immediate use

Generate the document now:`;
  }

  /**
   * Refine or improve a specific section of a document
   * Used for iterative improvement
   */
  async refineSection(
    sectionTitle: string,
    currentContent: string,
    improvementRequest: string,
  ): Promise<string> {
    this.logger.log(`Refining section: ${sectionTitle}`);

    const systemPrompt = `You are an expert editor for Brazilian procurement documents.
Your role is to refine and improve specific sections while maintaining:
- Legal compliance with Law 8.666/93 and Law 14.133/21
- Formal, professional tone
- Clarity and precision
- Consistency with the rest of the document`;

    const userPrompt = `Section: ${sectionTitle}

Current Content:
${currentContent}

Improvement Request:
${improvementRequest}

Please provide an improved version of this section that addresses the improvement request while maintaining legal compliance and professional quality.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      const refinedContent = content.type === 'text' ? content.text : '';

      this.logger.log(`Section refined: ${refinedContent.length} characters`);

      return refinedContent;
    } catch (error) {
      this.logger.error('Section refinement failed', error);
      throw error;
    }
  }
}
