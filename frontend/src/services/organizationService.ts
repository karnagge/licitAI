import api from './api';
import type { Organization } from '@shared/types/entities';
import type { OrganizationType } from '@shared/types/enums';

/**
 * Organization API Service
 * Handles all organization-related API calls
 */

export interface CreateOrganizationDto {
  name: string;
  type: OrganizationType;
  cnpj?: string;
  location?: string;
  primaryContactEmail: string;
  primaryContactName: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  type?: OrganizationType;
  cnpj?: string;
  location?: string;
  primaryContactEmail?: string;
  primaryContactName?: string;
}

/**
 * Create a new organization (used during registration)
 * This is a public endpoint - no authentication required
 */
export async function createOrganization(
  data: CreateOrganizationDto
): Promise<Organization> {
  const response = await api.post<Organization>('/organizations', data);
  return response.data;
}

/**
 * Get current user's organization
 * Requires authentication
 */
export async function getMyOrganization(): Promise<Organization> {
  const response = await api.get<Organization>('/organizations/me');
  return response.data;
}

/**
 * Update current user's organization
 * Requires authentication and ADMIN role
 * (Note: This endpoint may need to be implemented in the backend)
 */
export async function updateMyOrganization(
  data: UpdateOrganizationDto
): Promise<Organization> {
  const response = await api.patch<Organization>('/organizations/me', data);
  return response.data;
}

/**
 * Get organization by ID
 * Requires authentication
 * (Note: This endpoint may need to be implemented in the backend)
 */
export async function getOrganizationById(id: string): Promise<Organization> {
  const response = await api.get<Organization>(`/organizations/${id}`);
  return response.data;
}

export const organizationService = {
  createOrganization,
  getMyOrganization,
  updateMyOrganization,
  getOrganizationById,
};

export default organizationService;
