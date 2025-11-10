import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Researcher Agent
 * Responsible for researching relevant procurement law, templates,
 * and best practices to inform document generation.
 */
@Injectable()
export class ResearcherService {
  private readonly logger = new Logger(ResearcherService.name);
  private readonly anthropic: Anthropic;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Research relevant information for a given procurement type and context
   * @param context - The user's requirements and template information
   * @param template - Template structure to guide research
   * @returns Research findings and recommendations
   */
  async research(
    context: string,
    template: { name: string; sections: any[] },
  ): Promise<{
    findings: string;
    legalReferences: string[];
    recommendations: string[];
  }> {
    this.logger.log(`Researching for template: ${template.name}`);

    const systemPrompt = `You are a specialized research assistant for Brazilian procurement processes.
Your role is to research and provide relevant information about:
- Brazilian Law 8.666/93 and Law 14.133/21 (new procurement law)
- Best practices for ${template.name}
- Required sections and compliance requirements
- Common pitfalls to avoid

Provide your findings in a structured format with:
1. Key legal requirements
2. Best practices and recommendations
3. Specific considerations for the given context`;

    const userPrompt = `User Requirements:
${context}

Template: ${template.name}
Sections: ${template.sections.map((s) => s.title).join(', ')}

Please research and provide:
1. Relevant legal requirements (Law 8.666/93 and Law 14.133/21)
2. Best practices for this type of document
3. Specific recommendations based on the user's requirements`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for more factual research
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      const findings = content.type === 'text' ? content.text : '';

      // Parse findings to extract structured information
      const legalReferences = this.extractLegalReferences(findings);
      const recommendations = this.extractRecommendations(findings);

      this.logger.log(
        `Research completed: ${legalReferences.length} legal references, ${recommendations.length} recommendations`,
      );

      return {
        findings,
        legalReferences,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Research failed', error);
      throw error;
    }
  }

  /**
   * Extract legal references from research findings
   */
  private extractLegalReferences(findings: string): string[] {
    const references: string[] = [];
    // Simple regex to find Law references (e.g., "Lei 8.666/93", "Law 14.133/21")
    const legalRegex = /(?:Lei|Law)\s+[\d.]+\/\d{2,4}/gi;
    const matches = findings.match(legalRegex);

    if (matches) {
      references.push(...new Set(matches)); // Remove duplicates
    }

    return references;
  }

  /**
   * Extract recommendations from research findings
   */
  private extractRecommendations(findings: string): string[] {
    const recommendations: string[] = [];

    // Look for bullet points or numbered recommendations
    const lines = findings.split('\n');
    for (const line of lines) {
      if (
        line.trim().match(/^[-*•]\s/) ||
        line.trim().match(/^\d+\.\s/)
      ) {
        const recommendation = line.trim().replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '');
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations;
  }

  /**
   * Search for similar past documents to learn from
   * Uses vector similarity search on document embeddings
   */
  async searchSimilarDocuments(
    tenantId: string,
    query: string,
    limit = 5,
  ): Promise<any[]> {
    // TODO: Implement vector search when embeddings are available
    // For now, return empty array
    this.logger.log(
      `Searching for similar documents (not yet implemented): ${query}`,
    );

    return [];
  }
}
