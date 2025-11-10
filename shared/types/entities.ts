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
