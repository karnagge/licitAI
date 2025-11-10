import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ValidationIssue {
  severity: 'critical' | 'warning' | 'suggestion';
  section: string;
  issue: string;
  suggestion: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  summary: string;
}

/**
 * Validator Agent
 * Responsible for validating generated content against:
 * - Legal requirements (Law 8.666/93, Law 14.133/21)
 * - Template compliance
 * - Completeness and consistency
 */
@Injectable()
export class ValidatorService {
  private readonly logger = new Logger(ValidatorService.name);
  private readonly anthropic: Anthropic;

  constructor(private readonly config: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Validate a document against legal and template requirements
   * @param content - Document content to validate
   * @param template - Template structure with required sections
   * @param documentType - Type of procurement document
   * @returns Validation result with issues and recommendations
   */
  async validate(
    content: string,
    template: { name: string; sections: any[] },
    documentType: string,
  ): Promise<ValidationResult> {
    this.logger.log(`Validating document type: ${documentType}`);

    const systemPrompt = `You are a specialized validator for Brazilian procurement documents.
Your role is to validate documents against:
1. Brazilian Law 8.666/93 and Law 14.133/21 compliance
2. Template requirements and completeness
3. Internal consistency and clarity
4. Best practices for procurement documents

For each validation, identify:
- Critical issues that MUST be fixed (legal violations, missing required sections)
- Warnings that SHOULD be addressed (incomplete information, unclear language)
- Suggestions for improvement (best practices, clarity enhancements)

Provide a validation score from 0-100 where:
- 90-100: Excellent, ready for use
- 70-89: Good, minor improvements needed
- 50-69: Fair, significant improvements needed
- 0-49: Poor, major revisions required`;

    const userPrompt = `Document Type: ${documentType}
Template: ${template.name}
Required Sections: ${template.sections.map((s) => s.title).join(', ')}

Document Content:
${content}

Please validate this document and provide:
1. Overall validation score (0-100)
2. List of critical issues, warnings, and suggestions
3. Brief summary of validation results

Format your response as JSON:
{
  "score": <number>,
  "issues": [
    {
      "severity": "critical|warning|suggestion",
      "section": "<section name>",
      "issue": "<description>",
      "suggestion": "<how to fix>"
    }
  ],
  "summary": "<brief summary>"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.2, // Lower temperature for consistent validation
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
      let validationData: any;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = resultText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                         resultText.match(/(\{[\s\S]*\})/);
        const jsonText = jsonMatch ? jsonMatch[1] : resultText;
        validationData = JSON.parse(jsonText);
      } catch (parseError) {
        this.logger.warn('Failed to parse validation JSON, using fallback');
        validationData = {
          score: 50,
          issues: [
            {
              severity: 'warning',
              section: 'General',
              issue: 'Unable to parse validation results',
              suggestion: 'Manual review recommended',
            },
          ],
          summary: 'Validation completed with parsing errors',
        };
      }

      const result: ValidationResult = {
        isValid: validationData.score >= 70,
        score: validationData.score,
        issues: validationData.issues || [],
        summary: validationData.summary || 'Validation completed',
      };

      this.logger.log(
        `Validation completed: Score ${result.score}, ${result.issues.length} issues found`,
      );

      return result;
    } catch (error) {
      this.logger.error('Validation failed', error);
      throw error;
    }
  }

  /**
   * Quick validation for real-time feedback
   * Checks basic completeness and format
   */
  async quickValidate(
    content: string,
    requiredSections: string[],
  ): Promise<{ isComplete: boolean; missingSections: string[] }> {
    const missingSections: string[] = [];

    for (const section of requiredSections) {
      // Simple check if section title appears in content
      if (!content.toLowerCase().includes(section.toLowerCase())) {
        missingSections.push(section);
      }
    }

    return {
      isComplete: missingSections.length === 0,
      missingSections,
    };
  }
}
