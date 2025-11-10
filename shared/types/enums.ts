/**
 * Shared enum types - must match Prisma schema
 */

export enum OrganizationType {
  MUNICIPAL = 'MUNICIPAL',
  STATE = 'STATE',
  FEDERAL = 'FEDERAL',
  AUTONOMOUS = 'AUTONOMOUS',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}
