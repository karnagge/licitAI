import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ReviewFeedback {
  overallQuality: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  readinessLevel: 'ready' | 'minor-revisions' | 'major-revisions';
  summary: string;
}

/**
 * Reviewer Agent
 * Responsible for final quality review of generated documents.
 * Provides comprehensive feedback on:
 * - Overall quality and professionalism
 * - Legal compliance
 * - Completeness
 * - Clarity and readability
 * - Areas for improvement
 */
@Injectable()
export class ReviewerService {
  private readonly logger = new Logger(ReviewerService.name);
  private readonly anthropic: Anthropic;

  constructor(private readonly config: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Conduct comprehensive review of a document
   * @param content - Document content to review
   * @param template - Template the document should follow
   * @param documentType - Type of procurement document
   * @returns Detailed review feedback
   */
  async review(
    content: string,
    template: { name: string; sections: any[] },
    documentType: string,
  ): Promise<ReviewFeedback> {
    this.logger.log(`Reviewing document: ${documentType}`);

    const systemPrompt = `You are a senior procurement specialist reviewing documents for quality and compliance.
Your role is to provide constructive, actionable feedback on:

1. Legal Compliance
   - Adherence to Law 8.666/93 and Law 14.133/21
   - Proper legal references and citations
   - Required clauses and provisions

2. Completeness
   - All template sections addressed
   - Sufficient detail in each section
   - No missing critical information

3. Quality & Professionalism
   - Clear, professional language
   - Logical flow and organization
   - Consistency throughout
   - Appropriate formality level

4. Readability & Clarity
   - Easy to understand
   - No ambiguous language
   - Well-structured paragraphs

Provide honest, balanced feedback that highlights both strengths and areas for improvement.`;

    const userPrompt = `Document Type: ${documentType}
Template: ${template.name}

Document Content:
${content}

Please provide a comprehensive review with:
1. Overall quality score (0-100)
2. Key strengths of the document
3. Weaknesses or areas of concern
4. Specific suggestions for improvement
5. Readiness level (ready / minor-revisions / major-revisions)
6. Summary of your review

Format as JSON:
{
  "overallQuality": <number 0-100>,
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "readinessLevel": "ready|minor-revisions|major-revisions",
  "summary": "<brief summary>"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.3, // Lower for consistent, objective reviews
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const responseContent = response.content[0];
      const resultText =
        responseContent.type === 'text' ? responseContent.text : '';

      // Parse JSON response
      let reviewData: any;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = resultText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                         resultText.match(/(\{[\s\S]*\})/);
        const jsonText = jsonMatch ? jsonMatch[1] : resultText;
        reviewData = JSON.parse(jsonText);
      } catch (parseError) {
        this.logger.warn('Failed to parse review JSON, using fallback');
        reviewData = {
          overallQuality: 75,
          strengths: ['Document structure follows template'],
          weaknesses: ['Review parsing failed'],
          suggestions: ['Manual review recommended'],
          readinessLevel: 'minor-revisions',
          summary: 'Review completed with parsing errors',
        };
      }

      const feedback: ReviewFeedback = {
        overallQuality: reviewData.overallQuality || 75,
        strengths: reviewData.strengths || [],
        weaknesses: reviewData.weaknesses || [],
        suggestions: reviewData.suggestions || [],
        readinessLevel: reviewData.readinessLevel || 'minor-revisions',
        summary: reviewData.summary || 'Review completed',
      };

      this.logger.log(
        `Review completed: Quality ${feedback.overallQuality}/100, Readiness: ${feedback.readinessLevel}`,
      );

      return feedback;
    } catch (error) {
      this.logger.error('Review failed', error);
      throw error;
    }
  }

  /**
   * Quick quality check for real-time feedback
   * Faster, less detailed than full review
   */
  async quickCheck(content: string): Promise<{
    quality: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let quality = 100;

    // Basic heuristics
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 100) {
      issues.push('Document appears too short');
      quality -= 20;
    }

    // Check for placeholder text
    if (content.includes('[') && content.includes(']')) {
      issues.push('Contains placeholder text');
      quality -= 15;
    }

    // Check for minimum sections (simple heuristic)
    const sectionCount = (content.match(/\n#/g) || []).length;
    if (sectionCount < 3) {
      issues.push('May be missing sections');
      quality -= 10;
    }

    return { quality: Math.max(0, quality), issues };
  }

  /**
   * Compare document against original requirements
   * Ensures all user requirements were addressed
   */
  async checkRequirementsCoverage(
    content: string,
    requirements: string,
  ): Promise<{
    coverageScore: number;
    addressedRequirements: string[];
    missingRequirements: string[];
  }> {
    this.logger.log('Checking requirements coverage');

    const systemPrompt = `You are analyzing whether a generated document addresses all user requirements.
Compare the document content against the original requirements and identify:
1. Which requirements were successfully addressed
2. Which requirements are missing or inadequately addressed`;

    const userPrompt = `Original Requirements:
${requirements}

Generated Document:
${content}

Analyze coverage and respond in JSON:
{
  "coverageScore": <number 0-100>,
  "addressedRequirements": ["requirement 1", ...],
  "missingRequirements": ["requirement 1", ...]
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const responseContent = response.content[0];
      const resultText =
        responseContent.type === 'text' ? responseContent.text : '';

      const jsonMatch = resultText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                       resultText.match(/(\{[\s\S]*\})/);
      const jsonText = jsonMatch ? jsonMatch[1] : resultText;
      const data = JSON.parse(jsonText);

      return {
        coverageScore: data.coverageScore || 0,
        addressedRequirements: data.addressedRequirements || [],
        missingRequirements: data.missingRequirements || [],
      };
    } catch (error) {
      this.logger.error('Requirements coverage check failed', error);
      return {
        coverageScore: 0,
        addressedRequirements: [],
        missingRequirements: [],
      };
    }
  }
}
