-- Create HNSW vector indexes for similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS messages_embedding_idx ON messages USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS attachments_embedding_idx ON attachments USING hnsw (embedding vector_cosine_ops);

-- Enable Row-Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy for organizations (tenant_id = org id)
CREATE POLICY tenant_isolation_organizations ON organizations
  FOR ALL
  USING (id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy for users
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy for projects
CREATE POLICY tenant_isolation_projects ON projects
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy for templates (system templates or tenant-specific)
CREATE POLICY tenant_isolation_templates ON templates
  FOR ALL
  USING (
    is_system = true 
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- RLS Policy for documents
CREATE POLICY tenant_isolation_documents ON documents
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy for document_versions
CREATE POLICY tenant_isolation_document_versions ON document_versions
  FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- RLS Policy for chats
CREATE POLICY tenant_isolation_chats ON chats
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy for messages
CREATE POLICY tenant_isolation_messages ON messages
  FOR ALL
  USING (
    chat_id IN (
      SELECT id FROM chats 
      WHERE tenant_id::text = current_setting('app.current_tenant_id', true)
    )
  );

-- RLS Policy for attachments
CREATE POLICY tenant_isolation_attachments ON attachments
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy for audit_logs (read-only for tenants)
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR SELECT
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy for refresh_tokens (user-specific)
CREATE POLICY user_isolation_refresh_tokens ON refresh_tokens
  FOR ALL
  USING (user_id::text = current_setting('app.current_user_id', true));
