-- Enable Row-Level Security (RLS) for User Story 1 entities
-- This migration adds RLS policies and performance indexes

-- Enable RLS on projects table
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for projects: users can only access projects from their tenant
CREATE POLICY tenant_isolation_projects ON "Project"
  USING ("tenantId" = current_setting('app.current_tenant_id', true)::text);

-- Enable RLS on templates table (system templates accessible to all)
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for templates: system templates OR tenant's custom templates
CREATE POLICY tenant_isolation_templates ON "Template"
  USING ("isSystem" = true OR "tenantId" = current_setting('app.current_tenant_id', true)::text);

-- Enable RLS on documents table
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for documents: only tenant's documents
CREATE POLICY tenant_isolation_documents ON "Document"
  USING ("tenantId" = current_setting('app.current_tenant_id', true)::text);

-- Enable RLS on document_versions table (inherits from document)
ALTER TABLE "DocumentVersion" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for document versions: check via document's tenantId
CREATE POLICY tenant_isolation_document_versions ON "DocumentVersion"
  USING (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "DocumentVersion"."documentId"
      AND "Document"."tenantId" = current_setting('app.current_tenant_id', true)::text
    )
  );

-- Enable RLS on chats table
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for chats: check via project's tenantId
CREATE POLICY tenant_isolation_chats ON "Chat"
  USING (
    EXISTS (
      SELECT 1 FROM "Project"
      WHERE "Project"."id" = "Chat"."projectId"
      AND "Project"."tenantId" = current_setting('app.current_tenant_id', true)::text
    )
  );

-- Enable RLS on messages table
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for messages: check via chat's project's tenantId
CREATE POLICY tenant_isolation_messages ON "Message"
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      JOIN "Project" ON "Project"."id" = "Chat"."projectId"
      WHERE "Chat"."id" = "Message"."chatId"
      AND "Project"."tenantId" = current_setting('app.current_tenant_id', true)::text
    )
  );

-- Create HNSW vector indexes for similarity search (pgvector)
-- These indexes enable fast nearest-neighbor search for embeddings

-- Vector index for document embeddings
CREATE INDEX IF NOT EXISTS idx_document_embedding_hnsw
  ON "Document" USING hnsw (embedding vector_cosine_ops);

-- Vector index for message embeddings
CREATE INDEX IF NOT EXISTS idx_message_embedding_hnsw
  ON "Message" USING hnsw (embedding vector_cosine_ops);

-- Create composite indexes for query performance

-- Documents: tenant + project + status (for filtering)
CREATE INDEX IF NOT EXISTS idx_documents_tenant_project_status
  ON "Document" ("tenantId", "projectId", "status");

-- Documents: tenant + updated_at (for recent documents)
CREATE INDEX IF NOT EXISTS idx_documents_tenant_updated
  ON "Document" ("tenantId", "updatedAt" DESC);

-- Chats: tenant via project + updated_at (for recent chats)
CREATE INDEX IF NOT EXISTS idx_chats_project_updated
  ON "Chat" ("projectId", "updatedAt" DESC);

-- Messages: chat + created_at (for chat history)
CREATE INDEX IF NOT EXISTS idx_messages_chat_created
  ON "Message" ("chatId", "createdAt" ASC);

-- Projects: tenant + status (for active projects)
CREATE INDEX IF NOT EXISTS idx_projects_tenant_status
  ON "Project" ("tenantId", "status");

-- Projects: tenant + updated_at (for recent projects)
CREATE INDEX IF NOT EXISTS idx_projects_tenant_updated
  ON "Project" ("tenantId", "updatedAt" DESC);

-- Templates: isSystem + usageCount (for popular templates)
CREATE INDEX IF NOT EXISTS idx_templates_system_usage
  ON "Template" ("isSystem", "usageCount" DESC);

-- Templates: tenant + type (for filtering custom templates)
CREATE INDEX IF NOT EXISTS idx_templates_tenant_type
  ON "Template" ("tenantId", "type") WHERE "isSystem" = false;
