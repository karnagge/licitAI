import api from './api';
import type { Project } from '../../../shared/types/entities';

/**
 * Project API Service
 * Handles all project-related API calls
 */

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: string;
}

export interface ProjectsListResponse {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get all projects for current tenant
 * Supports pagination
 */
export async function getProjects(
  page = 1,
  pageSize = 12
): Promise<ProjectsListResponse> {
  const response = await api.get<ProjectsListResponse>('/projects', {
    params: { page, pageSize },
  });
  return response.data;
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<Project> {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await api.post<Project>('/projects', data);
  return response.data;
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  data: UpdateProjectDto
): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}`, data);
  return response.data;
}

/**
 * Archive a project (soft delete)
 */
export async function archiveProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

export const projectService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
};

export default projectService;
