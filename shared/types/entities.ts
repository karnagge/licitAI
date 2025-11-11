/**
 * Shared entity types across frontend and backend
 * Generated from Prisma schema
 */

export interface Organization {
  id: string;
  name: string;
  type: string;
  cnpj?: string;
  location?: string;
  primaryContactEmail: string;
  primaryContactName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
  emailVerified: boolean;
  status: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
  isSystem: boolean;
  tenantId?: string;
  sections: any; // JSONB field - structure depends on template type
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface Chat {
  id: string;
  projectId: string;
  title?: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  tenantId: string;
  createdBy?: string;
  createdAt: Date;
  embedding?: number[]; // Vector embedding for RAG
}
