import api from './api';
import type { Template } from '@shared/types/entities';
import type { TemplateType } from '@shared/types/enums';

/**
 * Template API Service
 * Handles all template-related API calls
 */

export interface CreateTemplateDto {
  name: string;
  description?: string;
  type: TemplateType;
  sections: any; // JSONB structure
}

export interface CreateFromDocumentDto {
  documentId: string;
  name: string;
  description?: string;
}

/**
 * Get all available templates (system + custom for tenant)
 * Optional filter by type
 */
export async function getTemplates(type?: TemplateType): Promise<Template[]> {
  const response = await api.get<Template[]>('/templates', {
    params: type ? { type } : undefined,
  });
  return response.data;
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(id: string): Promise<Template> {
  const response = await api.get<Template>(`/templates/${id}`);
  return response.data;
}

/**
 * Create a custom template (Admin/Manager only)
 */
export async function createTemplate(
  data: CreateTemplateDto
): Promise<Template> {
  const response = await api.post<Template>('/templates', data);
  return response.data;
}

/**
 * Create a template from an existing document
 * Extracts structure from document headings
 */
export async function createFromDocument(
  data: CreateFromDocumentDto
): Promise<Template> {
  const response = await api.post<Template>('/templates/from-document', data);
  return response.data;
}

export const templateService = {
  getTemplates,
  getTemplateById,
  createTemplate,
  createFromDocument,
};

export default templateService;
