import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class RefinementService {
  private readonly logger = new Logger(RefinementService.name);
  private readonly anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Refine selected text using AI
   * @param selectedText - Text selected by user
   * @param context - Surrounding document context
   * @param instruction - User instruction for improvement
   * @returns Improved text suggestion
   */
  async refineText(
    selectedText: string,
    context: string,
    instruction?: string,
  ): Promise<string> {
    this.logger.log('Refining text with AI');

    const prompt = this.buildRefinementPrompt(selectedText, context, instruction);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const refinedText = response.content[0].text;
      this.logger.log('Text refinement completed');

      return refinedText.trim();
    } catch (error) {
      this.logger.error('Failed to refine text', error);
      throw new Error('Failed to refine text with AI');
    }
  }

  /**
   * Build prompt for text refinement
   * @param selectedText - Selected text
   * @param context - Document context
   * @param instruction - User instruction
   * @returns Formatted prompt
   */
  private buildRefinementPrompt(
    selectedText: string,
    context: string,
    instruction?: string,
  ): string {
    let prompt = `Você é um assistente especializado em melhorar textos de documentos de licitação pública brasileira.

CONTEXTO DO DOCUMENTO:
${context}

TEXTO SELECIONADO PARA MELHORIA:
${selectedText}
`;

    if (instruction) {
      prompt += `\nINSTRUÇÃO DO USUÁRIO:
${instruction}
`;
    }

    prompt += `\nSua tarefa é melhorar o texto selecionado mantendo:
- Conformidade com a Lei 14.133/2021
- Clareza e objetividade
- Linguagem técnica adequada
- Estrutura e formatação apropriadas

Retorne APENAS o texto melhorado, sem explicações adicionais ou marcadores.`;

    return prompt;
  }
}
