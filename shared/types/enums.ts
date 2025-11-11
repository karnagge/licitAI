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

export enum TemplateType {
  ETP = 'ETP',
  BIDDING_NOTICE = 'BIDDING_NOTICE',
  CONTRACT = 'CONTRACT',
  CUSTOM = 'CUSTOM',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  FINAL = 'FINAL',
  ARCHIVED = 'ARCHIVED',
}

export enum ContentFormat {
  HTML = 'HTML',
  MARKDOWN = 'MARKDOWN',
}

export enum ChangeType {
  INITIAL = 'INITIAL',
  AI_GENERATED = 'AI_GENERATED',
  MANUAL_EDIT = 'MANUAL_EDIT',
  ROLLBACK = 'ROLLBACK',
  AUTO_SAVE = 'AUTO_SAVE',
}

export enum AttachmentStatus {
  UPLOADING = 'UPLOADING',
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
}
