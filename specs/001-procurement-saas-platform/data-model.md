# Data Model: Brazilian Procurement Document Generation Platform

**Feature**: `001-procurement-saas-platform`  
**Date**: November 3, 2025  
**Status**: Complete

## Overview

This document defines the complete data model for the multitenant procurement SaaS platform. All entities include tenant isolation via `tenant_id` column with Row-Level Security (RLS) policies enforced at the PostgreSQL level.

---

## Entity Relationship Diagram

```
Organization (1) ──< (N) User
      │
      └──< (N) Project
              │
              ├──< (N) Document ──< (N) DocumentVersion
              ├──< (N) Chat ──< (N) Message ──< (N) Attachment
              └──< (N) ProjectTemplate
              
Organization (1) ──< (N) Template (shared across projects)

User (1) ──< (N) AuditLog
User (1) ──< (N) RefreshToken
```

---

## Core Entities

### Organization

Represents a Brazilian public institution (municipality, state department, federal agency).

**Purpose**: Provides complete tenant isolation boundary. All data belongs to exactly one organization.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `name` (String, required, max 200): Institution name (e.g., "Prefeitura Municipal de São Paulo")
- `type` (Enum, required): Institution type
  - Values: `MUNICIPAL` | `STATE` | `FEDERAL` | `AUTONOMOUS`
- `cnpj` (String, optional, unique): Brazilian tax ID for institution
- `location` (String, optional, max 200): City/state location
- `primary_contact_email` (String, required): Main contact email
- `primary_contact_name` (String, required, max 150): Contact person name
- `status` (Enum, required): Account status
  - Values: `ACTIVE` | `SUSPENDED` | `TRIAL`
  - Default: `ACTIVE`
- `created_at` (DateTime, required): Account creation timestamp
- `updated_at` (DateTime, required): Last update timestamp

**Relationships**:
- Has many `User` (1:N)
- Has many `Project` (1:N)
- Has many `Template` (1:N)

**Indexes**:
- Primary: `id`
- Unique: `cnpj`
- Index: `status`, `created_at`

**Validation Rules**:
- `name` must be unique per `type` and `location` combination
- `primary_contact_email` must be valid email format
- `cnpj` must match Brazilian CNPJ format if provided

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON organizations
  FOR ALL
  USING (id = current_setting('app.current_tenant_id')::uuid);
```

---

### User

Represents a person using the platform within an organization.

**Purpose**: Authentication, authorization, and audit trail for actions.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `email` (String, required, unique): User email for login
- `password_hash` (String, required): Bcrypt hashed password
- `full_name` (String, required, max 150): User's full name
- `role` (Enum, required): Role within organization
  - Values: `ADMIN` | `MANAGER` | `EDITOR` | `VIEWER`
  - Default: `EDITOR`
- `tenant_id` (UUID, FK, required): Organization ID (tenant isolation)
- `email_verified` (Boolean, required): Email verification status
  - Default: `false`
- `status` (Enum, required): Account status
  - Values: `ACTIVE` | `INVITED` | `SUSPENDED`
  - Default: `ACTIVE`
- `last_login_at` (DateTime, optional): Last successful login
- `created_at` (DateTime, required): Account creation timestamp
- `updated_at` (DateTime, required): Last update timestamp

**Relationships**:
- Belongs to one `Organization` (N:1)
- Has many `Project` (creator)
- Has many `DocumentVersion` (creator)
- Has many `Message` (sender)
- Has many `AuditLog` (actor)
- Has many `RefreshToken` (1:N)

**Indexes**:
- Primary: `id`
- Unique: `email`
- Index: `tenant_id`, `email`, `status`
- Composite: (`tenant_id`, `role`)

**Validation Rules**:
- `email` must be valid format
- `password_hash` must be bcrypt hash with cost factor 12+
- `role` permissions hierarchy: `ADMIN` > `MANAGER` > `EDITOR` > `VIEWER`
  - `ADMIN`: Full organization management
  - `MANAGER`: Manage projects, templates, users
  - `EDITOR`: Create/edit projects and documents
  - `VIEWER`: Read-only access

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON users
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

### Project

Represents a single procurement process (e.g., one bidding cycle).

**Purpose**: Organizational unit grouping all related documents, chats, and work for one procurement.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `name` (String, required, max 200): Project name (e.g., "School Desks 2025")
- `description` (Text, optional): Detailed project description
- `status` (Enum, required): Project status
  - Values: `ACTIVE` | `COMPLETED` | `ARCHIVED` | `DRAFT`
  - Default: `ACTIVE`
- `tenant_id` (UUID, FK, required): Organization ID
- `created_by` (UUID, FK, required): User who created project
- `created_at` (DateTime, required): Creation timestamp
- `updated_at` (DateTime, required): Last update timestamp
- `completed_at` (DateTime, optional): Completion timestamp

**Relationships**:
- Belongs to one `Organization` (N:1)
- Belongs to one `User` (creator) (N:1)
- Has many `Document` (1:N)
- Has many `Chat` (1:N)
- Has many `Attachment` (1:N)

**Indexes**:
- Primary: `id`
- Index: `tenant_id`, `created_by`, `status`, `created_at`
- Composite: (`tenant_id`, `status`)
- Full-text: `name`, `description` (for search)

**Validation Rules**:
- `name` must be unique within organization
- Cannot change status from `COMPLETED` to `ACTIVE` (one-way transition)
- `completed_at` must be set when status changes to `COMPLETED`

**State Transitions**:
```
DRAFT → ACTIVE → COMPLETED → ARCHIVED
  ↓       ↓
ARCHIVED ←┘
```

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON projects
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

### Template

Defines reusable document structure with sections.

**Purpose**: Guide AI generation and ensure consistent document structure across organization.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `name` (String, required, max 200): Template name (e.g., "ETP - Technical Preliminary Study")
- `description` (Text, optional): Template purpose and usage
- `type` (Enum, required): Template category
  - Values: `ETP` | `BIDDING_NOTICE` | `CONTRACT` | `CUSTOM`
- `is_system` (Boolean, required): System-provided template
  - Default: `false`
- `tenant_id` (UUID, FK, nullable): Organization ID (null for system templates)
- `sections` (JSONB, required): Array of section definitions
  ```json
  [
    {
      "id": "uuid",
      "name": "Introdução",
      "order": 1,
      "description": "Contextualização do objeto",
      "required": true,
      "prompt_guidance": "Explain why this procurement is needed"
    }
  ]
  ```
- `created_by` (UUID, FK, nullable): User who created (null for system)
- `created_at` (DateTime, required): Creation timestamp
- `updated_at` (DateTime, required): Last update timestamp
- `usage_count` (Integer, required): Times used across projects
  - Default: `0`

**Relationships**:
- Belongs to one `Organization` (optional, N:1)
- Belongs to one `User` (creator, optional) (N:1)
- Has many `Document` (used in) (1:N)

**Indexes**:
- Primary: `id`
- Index: `tenant_id`, `type`, `is_system`, `usage_count`
- Full-text: `name`, `description`

**Validation Rules**:
- System templates (`is_system = true`) must have `tenant_id = null`
- Custom templates must have `tenant_id` set
- `sections` array must have at least 1 section
- Each section must have unique `order` within template
- Section `name` max 150 characters

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON templates
  FOR ALL
  USING (
    is_system = true 
    OR tenant_id = current_setting('app.current_tenant_id')::uuid
  );
```

---

### Document

Represents a generated procurement document.

**Purpose**: Store document content with complete version history.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `title` (String, required, max 300): Document title
- `status` (Enum, required): Document status
  - Values: `DRAFT` | `IN_REVIEW` | `FINAL` | `ARCHIVED`
  - Default: `DRAFT`
- `tenant_id` (UUID, FK, required): Organization ID
- `project_id` (UUID, FK, required): Parent project
- `template_id` (UUID, FK, required): Template used
- `current_version` (Integer, required): Latest version number
  - Default: `1`
- `embedding` (Vector(1536), optional): Document embedding for RAG
- `created_by` (UUID, FK, required): User who created
- `created_at` (DateTime, required): Creation timestamp
- `updated_at` (DateTime, required): Last update timestamp
- `finalized_at` (DateTime, optional): When status changed to FINAL

**Relationships**:
- Belongs to one `Organization` (N:1)
- Belongs to one `Project` (N:1)
- Belongs to one `Template` (N:1)
- Belongs to one `User` (creator) (N:1)
- Has many `DocumentVersion` (1:N)

**Indexes**:
- Primary: `id`
- Index: `tenant_id`, `project_id`, `template_id`, `status`, `created_at`
- Vector index: `embedding` (HNSW for similarity search)
- Composite: (`tenant_id`, `project_id`, `status`)

**Validation Rules**:
- Cannot edit after status is `FINAL` (create new document instead)
- `current_version` must match highest version number in `DocumentVersion`
- `embedding` generated asynchronously after content changes

**State Transitions**:
```
DRAFT → IN_REVIEW → FINAL → ARCHIVED
  ↓         ↓
  └─────────┘
```

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON documents
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

### DocumentVersion

Immutable snapshot of document content at a specific point in time.

**Purpose**: Audit trail, rollback capability, and compliance with transparency requirements.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `document_id` (UUID, FK, required): Parent document
- `version` (Integer, required): Sequential version number (1, 2, 3, ...)
- `content` (Text, required): Full document content (HTML/Markdown)
- `content_format` (Enum, required): Content format
  - Values: `HTML` | `MARKDOWN`
  - Default: `HTML`
- `change_type` (Enum, required): How this version was created
  - Values: `INITIAL` | `AI_GENERATED` | `MANUAL_EDIT` | `ROLLBACK` | `AUTO_SAVE`
- `change_description` (Text, optional): User-provided change description
- `created_by` (UUID, FK, required): User who created this version
- `created_at` (DateTime, required): Version creation timestamp
- `word_count` (Integer, required): Number of words in content
- `metadata` (JSONB, optional): Additional metadata
  ```json
  {
    "ai_agent": "Writer",
    "generation_duration_ms": 5420,
    "tokens_used": 3500
  }
  ```

**Relationships**:
- Belongs to one `Document` (N:1)
- Belongs to one `User` (creator) (N:1)

**Indexes**:
- Primary: `id`
- Unique: (`document_id`, `version`)
- Index: `document_id`, `created_by`, `created_at`, `change_type`
- Composite: (`document_id`, `version` DESC) for fast latest version query

**Validation Rules**:
- Versions are immutable (no updates after creation)
- `version` must be sequential (no gaps)
- `content` cannot be empty
- First version must have `change_type = INITIAL`

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON document_versions
  FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );
```

---

### Chat

Represents a conversation between user and AI within a project.

**Purpose**: Maintain context for AI agents and provide conversation history.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `title` (String, optional, max 200): User-defined chat title
- `tenant_id` (UUID, FK, required): Organization ID
- `project_id` (UUID, FK, required): Parent project
- `status` (Enum, required): Chat status
  - Values: `ACTIVE` | `ARCHIVED`
  - Default: `ACTIVE`
- `created_by` (UUID, FK, required): User who created
- `created_at` (DateTime, required): Creation timestamp
- `updated_at` (DateTime, required): Last message timestamp
- `message_count` (Integer, required): Total messages in chat
  - Default: `0`

**Relationships**:
- Belongs to one `Organization` (N:1)
- Belongs to one `Project` (N:1)
- Belongs to one `User` (creator) (N:1)
- Has many `Message` (1:N)

**Indexes**:
- Primary: `id`
- Index: `tenant_id`, `project_id`, `created_by`, `status`, `updated_at`
- Composite: (`tenant_id`, `project_id`, `updated_at` DESC)

**Validation Rules**:
- Auto-generate `title` from first user message if not provided
- Cannot delete chat if referenced by any document

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON chats
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

### Message

Individual message in a chat conversation.

**Purpose**: Store user inputs and AI responses with complete conversation history.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `chat_id` (UUID, FK, required): Parent chat
- `content` (Text, required): Message text content
- `role` (Enum, required): Message sender type
  - Values: `USER` | `ASSISTANT` | `SYSTEM`
- `agent_type` (Enum, optional): Which AI agent sent message
  - Values: `RESEARCHER` | `VALIDATOR` | `WRITER` | `REVIEWER`
  - Only set when `role = ASSISTANT`
- `embedding` (Vector(1536), optional): Message embedding for RAG
- `created_by` (UUID, FK, optional): User who sent (null for AI)
- `created_at` (DateTime, required): Message timestamp
- `metadata` (JSONB, optional): Additional context
  ```json
  {
    "generation_duration_ms": 2500,
    "tokens_used": 1200,
    "context_documents": ["doc-id-1", "doc-id-2"]
  }
  ```

**Relationships**:
- Belongs to one `Chat` (N:1)
- Belongs to one `User` (sender, optional) (N:1)
- Has many `Attachment` (1:N)

**Indexes**:
- Primary: `id`
- Index: `chat_id`, `role`, `created_at`
- Vector index: `embedding` (HNSW for similarity search)
- Composite: (`chat_id`, `created_at` ASC) for chronological order

**Validation Rules**:
- `content` cannot be empty
- `USER` role must have `created_by` set
- `ASSISTANT` role must have `agent_type` set
- Messages are immutable (no updates after creation)

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON messages
  FOR ALL
  USING (
    chat_id IN (
      SELECT id FROM chats 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );
```

---

### Attachment

File uploaded to chat for AI context.

**Purpose**: Provide reference documents (PDFs, spreadsheets) to inform AI generation.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `filename` (String, required, max 255): Original filename
- `mime_type` (String, required): File MIME type
- `size_bytes` (Integer, required): File size in bytes
- `storage_path` (String, required): Path on filesystem
- `tenant_id` (UUID, FK, required): Organization ID
- `project_id` (UUID, FK, required): Parent project
- `message_id` (UUID, FK, optional): Message it's attached to
- `status` (Enum, required): Processing status
  - Values: `UPLOADING` | `READY` | `PROCESSING` | `ERROR`
  - Default: `UPLOADING`
- `extracted_text` (Text, optional): Extracted content from file
- `embedding` (Vector(1536), optional): File content embedding for RAG
- `created_by` (UUID, FK, required): User who uploaded
- `created_at` (DateTime, required): Upload timestamp
- `processed_at` (DateTime, optional): When extraction completed

**Relationships**:
- Belongs to one `Organization` (N:1)
- Belongs to one `Project` (N:1)
- Belongs to one `Message` (optional) (N:1)
- Belongs to one `User` (uploader) (N:1)

**Indexes**:
- Primary: `id`
- Index: `tenant_id`, `project_id`, `message_id`, `status`, `created_at`
- Vector index: `embedding` (HNSW for similarity search)

**Validation Rules**:
- `size_bytes` must be <= 10MB (10,485,760 bytes)
- `mime_type` must be in allowed list:
  - `application/pdf`
  - `application/vnd.ms-excel`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/plain`
- `storage_path` format: `/uploads/{tenant_id}/{project_id}/{id}{extension}`

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON attachments
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

### AuditLog

Records all significant actions for transparency and debugging.

**Purpose**: Compliance with transparency requirements, debugging, and security monitoring.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `tenant_id` (UUID, FK, required): Organization ID
- `actor_id` (UUID, FK, optional): User who performed action (null for system)
- `action` (String, required, max 100): Action type
  - Examples: `USER_LOGIN`, `PROJECT_CREATED`, `DOCUMENT_UPDATED`, `TEMPLATE_DELETED`
- `entity_type` (String, required, max 50): Entity affected
  - Values: `User`, `Project`, `Document`, `Template`, etc.
- `entity_id` (UUID, optional): ID of affected entity
- `old_values` (JSONB, optional): State before change
- `new_values` (JSONB, optional): State after change
- `metadata` (JSONB, optional): Additional context
  ```json
  {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "request_id": "req-123"
  }
  ```
- `created_at` (DateTime, required): Action timestamp

**Relationships**:
- Belongs to one `Organization` (N:1)
- Belongs to one `User` (actor, optional) (N:1)

**Indexes**:
- Primary: `id`
- Index: `tenant_id`, `actor_id`, `action`, `entity_type`, `entity_id`, `created_at`
- Composite: (`tenant_id`, `created_at` DESC) for chronological queries
- Composite: (`entity_type`, `entity_id`, `created_at`)

**Validation Rules**:
- Entries are immutable (append-only)
- Retention: Keep all logs indefinitely for compliance
- `old_values` and `new_values` must be set for UPDATE actions

**RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON audit_logs
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

### RefreshToken

Stores refresh tokens for JWT authentication.

**Purpose**: Enable long-lived sessions with secure token rotation.

**Fields**:
- `id` (UUID, PK): Unique identifier
- `token` (String, required, unique): Refresh token value (UUID)
- `user_id` (UUID, FK, required): User who owns token
- `expires_at` (DateTime, required): Expiration timestamp
- `revoked_at` (DateTime, optional): When token was revoked (logout)
- `created_at` (DateTime, required): Token creation timestamp
- `last_used_at` (DateTime, optional): Last time token was used to refresh

**Relationships**:
- Belongs to one `User` (N:1)

**Indexes**:
- Primary: `id`
- Unique: `token`
- Index: `user_id`, `expires_at`, `revoked_at`

**Validation Rules**:
- Token expires after 7 days
- Revoked tokens cannot be used
- Auto-delete expired tokens after 30 days (cleanup job)

**RLS Policy**:
```sql
CREATE POLICY user_isolation ON refresh_tokens
  FOR ALL
  USING (
    user_id = current_setting('app.current_user_id')::uuid
  );
```

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

enum OrganizationType {
  MUNICIPAL
  STATE
  FEDERAL
  AUTONOMOUS
}

enum OrganizationStatus {
  ACTIVE
  SUSPENDED
  TRIAL
}

enum UserRole {
  ADMIN
  MANAGER
  EDITOR
  VIEWER
}

enum UserStatus {
  ACTIVE
  INVITED
  SUSPENDED
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum TemplateType {
  ETP
  BIDDING_NOTICE
  CONTRACT
  CUSTOM
}

enum DocumentStatus {
  DRAFT
  IN_REVIEW
  FINAL
  ARCHIVED
}

enum ContentFormat {
  HTML
  MARKDOWN
}

enum ChangeType {
  INITIAL
  AI_GENERATED
  MANUAL_EDIT
  ROLLBACK
  AUTO_SAVE
}

enum ChatStatus {
  ACTIVE
  ARCHIVED
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum AgentType {
  RESEARCHER
  VALIDATOR
  WRITER
  REVIEWER
}

enum AttachmentStatus {
  UPLOADING
  READY
  PROCESSING
  ERROR
}

model Organization {
  id                   String             @id @default(uuid()) @db.Uuid
  name                 String             @db.VarChar(200)
  type                 OrganizationType
  cnpj                 String?            @unique @db.VarChar(18)
  location             String?            @db.VarChar(200)
  primaryContactEmail  String             @map("primary_contact_email") @db.VarChar(255)
  primaryContactName   String             @map("primary_contact_name") @db.VarChar(150)
  status               OrganizationStatus @default(ACTIVE)
  createdAt            DateTime           @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime           @updatedAt @map("updated_at") @db.Timestamptz

  users       User[]
  projects    Project[]
  templates   Template[]
  chats       Chat[]
  documents   Document[]
  attachments Attachment[]
  auditLogs   AuditLog[]

  @@index([status, createdAt])
  @@map("organizations")
}

model User {
  id              String     @id @default(uuid()) @db.Uuid
  email           String     @unique @db.VarChar(255)
  passwordHash    String     @map("password_hash") @db.VarChar(255)
  fullName        String     @map("full_name") @db.VarChar(150)
  role            UserRole   @default(EDITOR)
  tenantId        String     @map("tenant_id") @db.Uuid
  emailVerified   Boolean    @default(false) @map("email_verified")
  status          UserStatus @default(ACTIVE)
  lastLoginAt     DateTime?  @map("last_login_at") @db.Timestamptz
  createdAt       DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime   @updatedAt @map("updated_at") @db.Timestamptz

  organization      Organization       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  projectsCreated   Project[]          @relation("ProjectCreator")
  documentsCreated  Document[]         @relation("DocumentCreator")
  versionsCreated   DocumentVersion[]  @relation("VersionCreator")
  chatsCreated      Chat[]             @relation("ChatCreator")
  messagesSent      Message[]          @relation("MessageSender")
  attachmentsUploaded Attachment[]     @relation("AttachmentUploader")
  auditLogs         AuditLog[]         @relation("AuditActor")
  refreshTokens     RefreshToken[]
  templatesCreated  Template[]         @relation("TemplateCreator")

  @@index([tenantId, email])
  @@index([tenantId, role])
  @@index([status])
  @@map("users")
}

model Project {
  id          String        @id @default(uuid()) @db.Uuid
  name        String        @db.VarChar(200)
  description String?       @db.Text
  status      ProjectStatus @default(ACTIVE)
  tenantId    String        @map("tenant_id") @db.Uuid
  createdBy   String        @map("created_by") @db.Uuid
  createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  completedAt DateTime?     @map("completed_at") @db.Timestamptz

  organization Organization @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  creator      User         @relation("ProjectCreator", fields: [createdBy], references: [id])
  documents    Document[]
  chats        Chat[]
  attachments  Attachment[]

  @@unique([tenantId, name])
  @@index([tenantId, status, createdAt])
  @@index([createdBy])
  @@map("projects")
}

model Template {
  id          String       @id @default(uuid()) @db.Uuid
  name        String       @db.VarChar(200)
  description String?      @db.Text
  type        TemplateType
  isSystem    Boolean      @default(false) @map("is_system")
  tenantId    String?      @map("tenant_id") @db.Uuid
  sections    Json         @db.JsonB
  createdBy   String?      @map("created_by") @db.Uuid
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime     @updatedAt @map("updated_at") @db.Timestamptz
  usageCount  Int          @default(0) @map("usage_count")

  organization Organization? @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  creator      User?         @relation("TemplateCreator", fields: [createdBy], references: [id])
  documents    Document[]

  @@index([tenantId, type])
  @@index([isSystem])
  @@index([usageCount])
  @@map("templates")
}

model Document {
  id             String         @id @default(uuid()) @db.Uuid
  title          String         @db.VarChar(300)
  status         DocumentStatus @default(DRAFT)
  tenantId       String         @map("tenant_id") @db.Uuid
  projectId      String         @map("project_id") @db.Uuid
  templateId     String         @map("template_id") @db.Uuid
  currentVersion Int            @default(1) @map("current_version")
  embedding      Unsupported("vector(1536)")?
  createdBy      String         @map("created_by") @db.Uuid
  createdAt      DateTime       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime       @updatedAt @map("updated_at") @db.Timestamptz
  finalizedAt    DateTime?      @map("finalized_at") @db.Timestamptz

  organization Organization      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  project      Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  template     Template          @relation(fields: [templateId], references: [id])
  creator      User              @relation("DocumentCreator", fields: [createdBy], references: [id])
  versions     DocumentVersion[]

  @@index([tenantId, projectId, status])
  @@index([templateId])
  @@index([createdAt])
  @@map("documents")
}

model DocumentVersion {
  id                String        @id @default(uuid()) @db.Uuid
  documentId        String        @map("document_id") @db.Uuid
  version           Int
  content           String        @db.Text
  contentFormat     ContentFormat @default(HTML) @map("content_format")
  changeType        ChangeType
  changeDescription String?       @map("change_description") @db.Text
  createdBy         String        @map("created_by") @db.Uuid
  createdAt         DateTime      @default(now()) @map("created_at") @db.Timestamptz
  wordCount         Int           @map("word_count")
  metadata          Json?         @db.JsonB

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  creator  User     @relation("VersionCreator", fields: [createdBy], references: [id])

  @@unique([documentId, version])
  @@index([documentId, createdAt])
  @@index([changeType])
  @@map("document_versions")
}

model Chat {
  id           String     @id @default(uuid()) @db.Uuid
  title        String?    @db.VarChar(200)
  tenantId     String     @map("tenant_id") @db.Uuid
  projectId    String     @map("project_id") @db.Uuid
  status       ChatStatus @default(ACTIVE)
  createdBy    String     @map("created_by") @db.Uuid
  createdAt    DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime   @updatedAt @map("updated_at") @db.Timestamptz
  messageCount Int        @default(0) @map("message_count")

  organization Organization @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  creator      User         @relation("ChatCreator", fields: [createdBy], references: [id])
  messages     Message[]

  @@index([tenantId, projectId, updatedAt(sort: Desc)])
  @@index([status])
  @@map("chats")
}

model Message {
  id        String      @id @default(uuid()) @db.Uuid
  chatId    String      @map("chat_id") @db.Uuid
  content   String      @db.Text
  role      MessageRole
  agentType AgentType?  @map("agent_type")
  embedding Unsupported("vector(1536)")?
  createdBy String?     @map("created_by") @db.Uuid
  createdAt DateTime    @default(now()) @map("created_at") @db.Timestamptz
  metadata  Json?       @db.JsonB

  chat        Chat         @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender      User?        @relation("MessageSender", fields: [createdBy], references: [id])
  attachments Attachment[]

  @@index([chatId, createdAt(sort: Asc)])
  @@index([role])
  @@map("messages")
}

model Attachment {
  id            String           @id @default(uuid()) @db.Uuid
  filename      String           @db.VarChar(255)
  mimeType      String           @map("mime_type") @db.VarChar(100)
  sizeBytes     Int              @map("size_bytes")
  storagePath   String           @map("storage_path") @db.VarChar(500)
  tenantId      String           @map("tenant_id") @db.Uuid
  projectId     String           @map("project_id") @db.Uuid
  messageId     String?          @map("message_id") @db.Uuid
  status        AttachmentStatus @default(UPLOADING)
  extractedText String?          @map("extracted_text") @db.Text
  embedding     Unsupported("vector(1536)")?
  createdBy     String           @map("created_by") @db.Uuid
  createdAt     DateTime         @default(now()) @map("created_at") @db.Timestamptz
  processedAt   DateTime?        @map("processed_at") @db.Timestamptz

  organization Organization @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  message      Message?     @relation(fields: [messageId], references: [id])
  uploader     User         @relation("AttachmentUploader", fields: [createdBy], references: [id])

  @@index([tenantId, projectId, status])
  @@index([messageId])
  @@map("attachments")
}

model AuditLog {
  id         String    @id @default(uuid()) @db.Uuid
  tenantId   String    @map("tenant_id") @db.Uuid
  actorId    String?   @map("actor_id") @db.Uuid
  action     String    @db.VarChar(100)
  entityType String    @map("entity_type") @db.VarChar(50)
  entityId   String?   @map("entity_id") @db.Uuid
  oldValues  Json?     @map("old_values") @db.JsonB
  newValues  Json?     @map("new_values") @db.JsonB
  metadata   Json?     @db.JsonB
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz

  organization Organization @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  actor        User?        @relation("AuditActor", fields: [actorId], references: [id])

  @@index([tenantId, createdAt(sort: Desc)])
  @@index([entityType, entityId, createdAt])
  @@index([action])
  @@map("audit_logs")
}

model RefreshToken {
  id         String    @id @default(uuid()) @db.Uuid
  token      String    @unique @db.VarChar(255)
  userId     String    @map("user_id") @db.Uuid
  expiresAt  DateTime  @map("expires_at") @db.Timestamptz
  revokedAt  DateTime? @map("revoked_at") @db.Timestamptz
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz
  lastUsedAt DateTime? @map("last_used_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt, revokedAt])
  @@map("refresh_tokens")
}
```

---

## Database Indexes Summary

Critical indexes for query performance:

| Table | Index | Purpose |
|-------|-------|---------|
| **organizations** | `(status, created_at)` | Filter active orgs, sort by creation |
| **users** | `(tenant_id, email)` | Tenant isolation + login lookup |
| **users** | `(tenant_id, role)` | Filter users by role within org |
| **projects** | `(tenant_id, status, created_at)` | List projects filtered and sorted |
| **projects** | `(tenant_id, name)` UNIQUE | Enforce name uniqueness per org |
| **documents** | `(tenant_id, project_id, status)` | List documents in project |
| **documents** | `embedding` HNSW | Vector similarity search for RAG |
| **document_versions** | `(document_id, version)` UNIQUE | Enforce sequential versions |
| **document_versions** | `(document_id, created_at)` | Version history chronological |
| **chats** | `(tenant_id, project_id, updated_at DESC)` | Recent chats in project |
| **messages** | `(chat_id, created_at ASC)` | Chronological message order |
| **messages** | `embedding` HNSW | Vector similarity for context retrieval |
| **attachments** | `(tenant_id, project_id, status)` | List attachments in project |
| **attachments** | `embedding` HNSW | Vector similarity for file search |
| **audit_logs** | `(tenant_id, created_at DESC)` | Recent audit events |
| **audit_logs** | `(entity_type, entity_id, created_at)` | Entity-specific audit trail |

---

## Migration Strategy

### Phase 1: Core Tables
1. Create organizations, users, refresh_tokens
2. Enable RLS on organizations and users
3. Seed system templates

### Phase 2: Project Management
1. Create projects, templates
2. Enable RLS on projects and templates
3. Create indexes

### Phase 3: Document System
1. Create documents, document_versions
2. Enable RLS on documents and document_versions
3. Create vector indexes for embeddings

### Phase 4: Chat & AI
1. Create chats, messages, attachments
2. Enable RLS on all chat tables
3. Create vector indexes for RAG

### Phase 5: Audit & Monitoring
1. Create audit_logs
2. Enable RLS on audit_logs
3. Set up automatic audit triggers

---

## Summary

- **Total Entities**: 11 core entities
- **Tenant Isolation**: All entities include `tenant_id` with RLS policies
- **Vector Embeddings**: 3 entities with pgvector columns (documents, messages, attachments)
- **Audit Trail**: Complete audit logging for all modifications
- **Immutability**: DocumentVersion and AuditLog are append-only
- **Relationships**: Clear hierarchical structure: Organization → Project → Document/Chat
- **Indexes**: Optimized for common queries (tenant filtering, chronological sorting, vector similarity)
