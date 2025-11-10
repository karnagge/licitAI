# Tasks: Brazilian Procurement Document Generation Platform

**Input**: Design documents from `/specs/001-procurement-saas-platform/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api-spec.yaml ✓

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are included but marked as optional. Focus on MVP implementation first.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Task Categories

**[CQ]**: Code Quality tasks (TypeScript strict, component hierarchy, JSDoc)
**[TS]**: Testing Standards tasks (unit, integration, e2e, mocking)
**[UX]**: User Experience tasks (minimalist design, accessibility, progressive disclosure)
**[PF]**: Performance tasks (optimization, indexing, bundle size, streaming)
**[SEC]**: Security & Multitenant tasks (RLS, audit logs, input validation)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure following plan.md

- [X] T001 Create project root structure with frontend/, backend/, and shared/ directories
- [X] T002 [P] Initialize backend NestJS project with TypeScript strict mode in backend/package.json
- [X] T003 [P] Initialize frontend Vite + React project with TypeScript strict mode in frontend/package.json
- [X] T004 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.json
- [X] T005 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.json
- [X] T006 [P] Setup TailwindCSS configuration in frontend/tailwind.config.js
- [X] T007 [P] Create shared TypeScript types directory in shared/types/
- [X] T008 Create Docker Compose configuration in docker-compose.yml for PostgreSQL with pgvector
- [X] T009 Create backend environment variables template in backend/.env.example
- [X] T010 [P] Create frontend environment variables template in frontend/.env.example
- [X] T011 [P] Configure absolute imports for backend in backend/tsconfig.json
- [X] T012 [P] Configure absolute imports for frontend in frontend/tsconfig.json
- [X] T013 Setup Prisma ORM in backend/prisma/schema.prisma with PostgreSQL provider
- [X] T014 Enable pgvector extension in Prisma schema
- [X] T015 Create uploads directory structure in backend/uploads/ (gitignored)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Multitenant Infrastructure

- [X] T016 [SEC] Define Organization entity in backend/prisma/schema.prisma with all fields from data-model.md
- [X] T017 [SEC] Define User entity in backend/prisma/schema.prisma with tenant_id and role enum
- [X] T018 [P] [SEC] Define RefreshToken entity in backend/prisma/schema.prisma
- [X] T019 [SEC] Create PostgreSQL migration for organizations, users, refresh_tokens tables
- [X] T020 [SEC] Enable Row-Level Security policies for organizations table in migration
- [X] T021 [SEC] Enable Row-Level Security policies for users table in migration
- [X] T022 [PF] Create indexes on tenant_id, email, status for users table in migration
- [X] T023 [PF] Create composite index on (tenant_id, role) for users table in migration

### Authentication & Authorization

- [X] T024 Setup Passport.js with JWT strategy in backend/src/modules/auth/strategies/jwt.strategy.ts
- [X] T025 [P] Setup Passport.js with Local strategy in backend/src/modules/auth/strategies/local.strategy.ts
- [X] T026 Create JWT authentication guard in backend/src/common/guards/jwt-auth.guard.ts
- [X] T027 [P] [SEC] Create tenant isolation guard in backend/src/common/guards/tenant.guard.ts
- [X] T028 [P] Create role-based authorization guard in backend/src/common/guards/roles.guard.ts
- [X] T029 Create CurrentUser decorator in backend/src/common/decorators/current-user.decorator.ts
- [X] T030 [P] Create CurrentTenant decorator in backend/src/common/decorators/current-tenant.decorator.ts
- [X] T031 Create Auth DTOs (LoginDto, RegisterDto) in backend/src/modules/auth/dto/
- [X] T032 Create Auth service with bcrypt password hashing in backend/src/modules/auth/auth.service.ts
- [X] T033 Create Auth controller with /login and /register endpoints in backend/src/modules/auth/auth.controller.ts
- [X] T034 Create Auth module in backend/src/modules/auth/auth.module.ts
- [X] T035 Setup Prisma middleware for automatic tenant_id injection in backend/src/prisma/prisma.service.ts
- [X] T036 Configure CORS middleware in backend/src/main.ts to allow frontend origin

### API Infrastructure

- [X] T037 [P] Create global exception filter in backend/src/common/filters/http-exception.filter.ts
- [X] T038 [P] Create logging interceptor in backend/src/common/interceptors/logging.interceptor.ts
- [X] T039 [P] Setup Class-validator pipes in backend/src/main.ts for DTO validation
- [X] T040 Create API version prefix /v1 in backend/src/main.ts

### Frontend Infrastructure

- [X] T041 Create TanStack Query client configuration in frontend/src/services/queryClient.ts
- [X] T042 [P] Create Axios HTTP client with interceptors in frontend/src/services/api.ts
- [X] T043 [P] Create authentication context in frontend/src/contexts/AuthContext.tsx
- [X] T044 Setup React Router with protected routes in frontend/src/App.tsx
- [X] T045 [P] [UX] Create base UI components (Button, Input, Card) in frontend/src/components/ui/
- [X] T046 [P] [UX] Create base layout components in frontend/src/components/layouts/DashboardLayout.tsx
- [X] T047 [UX] Define consistent spacing scale in frontend/src/styles/globals.css
- [X] T048 [UX] Setup color system with WCAG AA compliant contrast ratios in frontend/tailwind.config.js

### Shared Types

- [X] T049 [P] Define shared entity types in shared/types/entities.ts
- [X] T050 [P] Define shared enum types in shared/types/enums.ts
- [X] T051 [P] Define shared DTO types in shared/types/dtos.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Organization Setup and First Document Generation (Priority: P1) 🎯 MVP

**Goal**: Complete end-to-end value proposition - from account creation to a finished, compliant procurement document

**Independent Test**: Can be fully tested by: (1) Creating an organization account, (2) Creating a project, (3) Selecting a template, (4) Describing needs in chat, (5) Receiving a generated document. Delivers immediate value - a compliant procurement document in minutes vs. days.

### Database Schema for US1

- [X] T052 [P] [US1] Define Project entity in backend/prisma/schema.prisma with tenant isolation
- [X] T053 [P] [US1] Define Template entity in backend/prisma/schema.prisma with sections JSONB field
- [X] T054 [P] [US1] Define Document entity in backend/prisma/schema.prisma with embedding vector
- [X] T055 [P] [US1] Define DocumentVersion entity in backend/prisma/schema.prisma with immutable versions
- [X] T056 [P] [US1] Define Chat entity in backend/prisma/schema.prisma
- [X] T057 [P] [US1] Define Message entity in backend/prisma/schema.prisma with embedding vector
- [X] T058 [SEC] [US1] Create migration for projects, templates, documents, document_versions, chats, messages tables
- [ ] T059 [SEC] [US1] Enable RLS policies for all US1 entities in migration
- [ ] T060 [PF] [US1] Create HNSW vector indexes on document.embedding and message.embedding in migration
- [ ] T061 [PF] [US1] Create composite indexes on (tenant_id, project_id, status) for documents in migration
- [ ] T062 [PF] [US1] Create composite indexes on (tenant_id, project_id, updated_at DESC) for chats in migration
- [ ] T063 [US1] Seed system templates (ETP, Bidding Notice, Contract) in backend/prisma/seed.ts

### Backend - Organizations Module (US1)

- [X] T064 [P] [US1] Create Organization DTOs in backend/src/modules/organizations/dto/
- [X] T065 [US1] Create Organizations service in backend/src/modules/organizations/organizations.service.ts
- [X] T066 [US1] Create Organizations controller with POST /organizations endpoint in backend/src/modules/organizations/organizations.controller.ts
- [X] T067 [US1] Create Organizations module in backend/src/modules/organizations/organizations.module.ts

### Backend - Projects Module (US1)

- [X] T068 [P] [US1] Create Project DTOs in backend/src/modules/projects/dto/
- [X] T069 [SEC] [US1] Create Projects service with tenant isolation in backend/src/modules/projects/projects.service.ts
- [X] T070 [US1] Create Projects controller with GET /projects and POST /projects endpoints in backend/src/modules/projects/projects.controller.ts
- [X] T071 [US1] Create Projects module in backend/src/modules/projects/projects.module.ts

### Backend - Templates Module (US1)

- [X] T072 [P] [US1] Create Template DTOs in backend/src/modules/templates/dto/
- [X] T073 [US1] Create Templates service with system and custom template logic in backend/src/modules/templates/templates.service.ts
- [X] T074 [US1] Create Templates controller with GET /templates endpoint in backend/src/modules/templates/templates.controller.ts
- [X] T075 [US1] Create Templates module in backend/src/modules/templates/templates.module.ts

### Backend - AI Agents Module (US1)

- [X] T076 [P] [US1] Install Claude Agent SDK (@anthropic-ai/sdk) in backend/package.json
- [X] T077 [P] [US1] Create Researcher Agent service in backend/src/modules/ai-agents/researcher.service.ts
- [X] T078 [P] [US1] Create Validator Agent service in backend/src/modules/ai-agents/validator.service.ts
- [X] T079 [P] [US1] Create Writer Agent service in backend/src/modules/ai-agents/writer.service.ts
- [X] T080 [P] [US1] Create Reviewer Agent service in backend/src/modules/ai-agents/reviewer.service.ts
- [X] T081 [US1] Create Agent orchestration service in backend/src/modules/ai-agents/orchestration.service.ts
- [X] T082 [P] [PF] [US1] Implement SSE streaming for Writer Agent in backend/src/modules/ai-agents/writer.service.ts
- [X] T083 [US1] Create AI Agents module in backend/src/modules/ai-agents/ai-agents.module.ts

### Backend - Chats Module (US1)

- [X] T084 [P] [US1] Create Chat DTOs in backend/src/modules/chats/dto/
- [X] T085 [SEC] [US1] Create Chats service with tenant isolation in backend/src/modules/chats/chats.service.ts
- [X] T086 [US1] Create Chats controller with POST /projects/:projectId/chats endpoint in backend/src/modules/chats/chats.controller.ts
- [X] T087 [US1] Create Chats module in backend/src/modules/chats/chats.module.ts

### Backend - Messages Module (US1)

- [X] T088 [P] [US1] Create Message DTOs in backend/src/modules/messages/dto/
- [X] T089 [SEC] [US1] Create Messages service with input validation before AI calls in backend/src/modules/messages/messages.service.ts
- [X] T090 [PF] [US1] Create Messages controller with SSE endpoint POST /chats/:chatId/messages/stream in backend/src/modules/messages/messages.controller.ts
- [X] T091 [US1] Integrate agent orchestration in Messages service message handler
- [X] T092 [US1] Create Messages module in backend/src/modules/messages/messages.module.ts

### Backend - Documents Module (US1)

- [X] T093 [P] [US1] Create Document DTOs in backend/src/modules/documents/dto/
- [X] T094 [SEC] [US1] Create Documents service with tenant isolation in backend/src/modules/documents/documents.service.ts
- [X] T095 [US1] Implement document version creation logic in Documents service
- [ ] T096 [PF] [US1] Implement async embedding generation for documents in Documents service
- [X] T097 [US1] Create Documents controller with POST /projects/:projectId/documents and GET /documents/:id endpoints in backend/src/modules/documents/documents.controller.ts
- [ ] T098 [US1] Implement document export to PDF in backend/src/modules/documents/documents.service.ts
- [ ] T099 [US1] Implement document export to DOCX in backend/src/modules/documents/documents.service.ts
- [X] T100 [US1] Create Documents module in backend/src/modules/documents/documents.module.ts

### Frontend - Authentication Pages (US1)

- [ ] T101 [P] [UX] [US1] Create LoginForm component in frontend/src/components/forms/LoginForm.tsx
- [ ] T102 [P] [UX] [US1] Create RegisterForm component in frontend/src/components/forms/RegisterForm.tsx
- [ ] T103 [UX] [US1] Create Login page in frontend/src/pages/auth/Login.tsx
- [ ] T104 [P] [UX] [US1] Create Register page in frontend/src/pages/auth/Register.tsx
- [ ] T105 [US1] Create authentication API hooks in frontend/src/hooks/useAuth.ts

### Frontend - Organization Setup (US1)

- [ ] T106 [P] [UX] [US1] Create OrganizationForm component in frontend/src/components/forms/OrganizationForm.tsx
- [ ] T107 [UX] [US1] Create organization API service in frontend/src/services/organizationService.ts
- [ ] T108 [US1] Create organization creation flow in Register page

### Frontend - Dashboard & Projects (US1)

- [ ] T109 [P] [UX] [US1] Create ProjectCard component in frontend/src/components/features/ProjectCard.tsx
- [ ] T110 [P] [UX] [US1] Create ProjectForm component in frontend/src/components/forms/ProjectForm.tsx
- [ ] T111 [UX] [US1] Create Dashboard page showing projects list in frontend/src/pages/dashboard/Dashboard.tsx
- [ ] T112 [UX] [US1] Create empty state guidance component in frontend/src/components/ui/EmptyState.tsx
- [ ] T113 [US1] Create projects API hooks in frontend/src/hooks/useProjects.ts
- [ ] T114 [PF] [US1] Implement pagination for projects list in Dashboard

### Frontend - Template Selection (US1)

- [ ] T115 [P] [UX] [US1] Create TemplateCard component in frontend/src/components/features/TemplateCard.tsx
- [ ] T116 [P] [UX] [US1] Create TemplatePreview modal component in frontend/src/components/features/TemplatePreview.tsx
- [ ] T117 [UX] [US1] Create TemplateSelection page in frontend/src/pages/projects/TemplateSelection.tsx
- [ ] T118 [US1] Create templates API hooks in frontend/src/hooks/useTemplates.ts

### Frontend - Chat Interface (US1)

- [ ] T119 [P] [UX] [US1] Create ChatMessage component in frontend/src/components/features/ChatMessage.tsx
- [ ] T120 [P] [UX] [US1] Create ChatInput component in frontend/src/components/features/ChatInput.tsx
- [ ] T121 [P] [UX] [US1] Create AgentStatusIndicator component in frontend/src/components/features/AgentStatusIndicator.tsx
- [ ] T122 [UX] [US1] Create ChatInterface organism in frontend/src/components/features/ChatInterface.tsx
- [ ] T123 [PF] [US1] Implement SSE streaming for real-time AI responses in frontend/src/hooks/useChat.ts
- [ ] T124 [UX] [US1] Add typing indicators while AI is processing in ChatInterface
- [ ] T125 [US1] Create chat API hooks in frontend/src/hooks/useChat.ts

### Frontend - Document View (US1)

- [ ] T126 [P] [UX] [US1] Create DocumentViewer component in frontend/src/components/features/DocumentViewer.tsx
- [ ] T127 [P] [UX] [US1] Create DocumentToolbar component in frontend/src/components/features/DocumentToolbar.tsx
- [ ] T128 [UX] [US1] Create DocumentView page in frontend/src/pages/projects/DocumentView.tsx
- [ ] T129 [US1] Create documents API hooks in frontend/src/hooks/useDocuments.ts
- [ ] T130 [US1] Implement document export (PDF/DOCX) in DocumentToolbar

### Frontend - Project Detail Page (US1)

- [ ] T131 [UX] [US1] Create ProjectDetail page combining chat and document view in frontend/src/pages/projects/ProjectDetail.tsx
- [ ] T132 [UX] [US1] Add navigation breadcrumbs in ProjectDetail page
- [ ] T133 [UX] [US1] Implement split-pane layout with chat on left, document on right

### Testing for US1 (OPTIONAL)

- [ ] T134 [P] [TS] [US1] Create JWT authentication guard unit tests in backend/test/unit/guards/jwt-auth.guard.spec.ts
- [ ] T135 [P] [TS] [US1] Create tenant isolation guard unit tests in backend/test/unit/guards/tenant.guard.spec.ts
- [ ] T136 [P] [TS] [US1] Create Organizations service unit tests in backend/test/unit/organizations/organizations.service.spec.ts
- [ ] T137 [P] [TS] [US1] Create Projects service unit tests in backend/test/unit/projects/projects.service.spec.ts
- [ ] T138 [P] [TS] [US1] Create agent orchestration unit tests in backend/test/unit/ai-agents/orchestration.service.spec.ts
- [ ] T139 [P] [TS] [US1] Mock Claude API calls in backend/test/fixtures/claude-mock.ts
- [ ] T140 [P] [TS] [US1] Create authentication integration tests in backend/test/integration/auth.e2e.spec.ts
- [ ] T141 [P] [TS] [US1] Create organization creation integration tests in backend/test/integration/organizations.e2e.spec.ts
- [ ] T142 [P] [TS] [US1] Create project creation integration tests in backend/test/integration/projects.e2e.spec.ts
- [ ] T143 [TS] [US1] Create document generation flow integration tests in backend/test/integration/documents.e2e.spec.ts
- [ ] T144 [TS] [US1] Create E2E test for complete user journey in frontend/tests/e2e/user-story-1.spec.ts using Playwright
- [ ] T145 [P] [TS] [US1] Create LoginForm component tests in frontend/tests/unit/LoginForm.test.tsx
- [ ] T146 [P] [TS] [US1] Create ChatInterface component tests in frontend/tests/unit/ChatInterface.test.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create an organization, project, select a template, chat with AI, and receive a generated document. This is the MVP!

---

## Phase 4: User Story 2 - Document Refinement with AI Assistance (Priority: P2)

**Goal**: Enable users to refine and perfect their documents through iterative AI assistance

**Independent Test**: Can be tested independently by: (1) Loading an existing generated document, (2) Selecting a section, (3) Asking AI to improve it, (4) Seeing revised content. Delivers value by enabling document perfection.

### Backend - Document Editing (US2)

- [ ] T147 [P] [US2] Add PATCH /documents/:id endpoint to Documents controller for manual edits
- [ ] T148 [US2] Implement auto-save logic with 30-second debounce in Documents service
- [ ] T149 [US2] Add save status tracking in Documents service
- [ ] T150 [SEC] [US2] Create new DocumentVersion on every edit in Documents service

### Backend - AI Refinement (US2)

- [ ] T151 [P] [US2] Create text selection improvement endpoint POST /documents/:id/improve in Documents controller
- [ ] T152 [US2] Implement inline AI suggestion service in backend/src/modules/ai-agents/refinement.service.ts
- [ ] T153 [US2] Add contextual chat continuation in Messages service for document refinement

### Frontend - Document Editor (US2)

- [ ] T154 [P] [UX] [US2] Create RichTextEditor component with formatting toolbar in frontend/src/components/features/RichTextEditor.tsx
- [ ] T155 [P] [UX] [US2] Create InlineActionMenu component for text selection in frontend/src/components/features/InlineActionMenu.tsx
- [ ] T156 [PF] [US2] Implement auto-save with debounce in useDocuments hook
- [ ] T157 [UX] [US2] Add save status indicator to DocumentToolbar
- [ ] T158 [US2] Create document editing hooks in frontend/src/hooks/useDocumentEditor.ts

### Frontend - AI Refinement UI (US2)

- [ ] T159 [P] [UX] [US2] Create SuggestionModal component in frontend/src/components/features/SuggestionModal.tsx
- [ ] T160 [UX] [US2] Implement text selection handler in RichTextEditor
- [ ] T161 [US2] Integrate inline AI improvement in InlineActionMenu
- [ ] T162 [UX] [US2] Add "Ask AI to improve" button to InlineActionMenu

### Testing for US2 (OPTIONAL)

- [ ] T163 [P] [TS] [US2] Create document editing integration tests in backend/test/integration/document-editing.e2e.spec.ts
- [ ] T164 [P] [TS] [US2] Create AI refinement unit tests in backend/test/unit/ai-agents/refinement.service.spec.ts
- [ ] T165 [TS] [US2] Create E2E test for document refinement flow in frontend/tests/e2e/user-story-2.spec.ts
- [ ] T166 [P] [TS] [US2] Create RichTextEditor component tests in frontend/tests/unit/RichTextEditor.test.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can now refine documents after generation.

---

## Phase 5: User Story 3 - Version History and Rollback (Priority: P2)

**Goal**: Provide transparency and confidence through complete document evolution tracking and rollback capability

**Independent Test**: Can be tested by: (1) Making several changes to a document, (2) Viewing version history, (3) Comparing versions side-by-side, (4) Rolling back to a previous version. Delivers transparency and confidence.

### Backend - Version History (US3)

- [ ] T167 [P] [US3] Create GET /documents/:id/versions endpoint in Documents controller
- [ ] T168 [US3] Create GET /documents/:id/versions/:version endpoint for specific version
- [ ] T169 [US3] Implement version comparison logic in Documents service
- [ ] T170 [US3] Create POST /documents/:id/rollback endpoint in Documents controller
- [ ] T171 [SEC] [US3] Ensure rollback creates new version (not overwrite) in Documents service

### Frontend - Version History UI (US3)

- [ ] T172 [P] [UX] [US3] Create VersionHistoryPanel component in frontend/src/components/features/VersionHistoryPanel.tsx
- [ ] T173 [P] [UX] [US3] Create VersionListItem component in frontend/src/components/features/VersionListItem.tsx
- [ ] T174 [P] [UX] [US3] Create VersionComparisonView component with side-by-side diff in frontend/src/components/features/VersionComparisonView.tsx
- [ ] T175 [UX] [US3] Add version history button to DocumentToolbar
- [ ] T176 [US3] Create version history hooks in frontend/src/hooks/useVersionHistory.ts
- [ ] T177 [UX] [US3] Implement diff highlighting (green for additions, red for deletions) in VersionComparisonView
- [ ] T178 [US3] Add rollback confirmation modal in VersionHistoryPanel

### Testing for US3 (OPTIONAL)

- [ ] T179 [P] [TS] [US3] Create version history integration tests in backend/test/integration/versions.e2e.spec.ts
- [ ] T180 [P] [TS] [US3] Create rollback logic unit tests in backend/test/unit/documents/rollback.spec.ts
- [ ] T181 [TS] [US3] Create E2E test for version history flow in frontend/tests/e2e/user-story-3.spec.ts
- [ ] T182 [P] [TS] [US3] Create VersionComparisonView component tests in frontend/tests/unit/VersionComparisonView.test.tsx

**Checkpoint**: All user stories 1-3 should now be independently functional. Users have complete audit trail and rollback capability.

---

## Phase 6: User Story 4 - Multi-Project and Template Management (Priority: P2)

**Goal**: Scale to real-world usage where organizations handle multiple procurement processes simultaneously

**Independent Test**: Can be tested by: (1) Creating multiple projects, (2) Switching between them, (3) Creating a custom template, (4) Reusing it in another project. Delivers organizational efficiency.

### Backend - Multi-Project Management (US4)

- [ ] T183 [P] [US4] Add project status filtering to GET /projects endpoint
- [ ] T184 [P] [US4] Add project archiving endpoint PUT /projects/:id/archive
- [ ] T185 [PF] [US4] Implement full-text search on project names in Projects service
- [ ] T186 [US4] Add project status transition validation in Projects service

### Backend - Custom Templates (US4)

- [ ] T187 [P] [US4] Create POST /templates endpoint for custom template creation in Templates controller
- [ ] T188 [P] [US4] Create PUT /templates/:id endpoint for template editing in Templates controller
- [ ] T189 [US4] Create POST /documents/:id/save-as-template endpoint in Documents controller
- [ ] T190 [US4] Implement template validation logic in Templates service
- [ ] T191 [US4] Increment template usage_count when used in Templates service

### Frontend - Multi-Project UI (US4)

- [ ] T192 [P] [UX] [US4] Add project status filter to Dashboard page
- [ ] T193 [P] [UX] [US4] Add project search input to Dashboard page
- [ ] T194 [P] [UX] [US4] Create ProjectStatusBadge component in frontend/src/components/ui/ProjectStatusBadge.tsx
- [ ] T195 [UX] [US4] Add archive project button to ProjectCard
- [ ] T196 [US4] Implement project filtering and search in useProjects hook

### Frontend - Custom Templates UI (US4)

- [ ] T197 [P] [UX] [US4] Create CustomTemplateForm component in frontend/src/components/forms/CustomTemplateForm.tsx
- [ ] T198 [P] [UX] [US4] Create TemplateSectionEditor component in frontend/src/components/features/TemplateSectionEditor.tsx
- [ ] T199 [UX] [US4] Create Templates management page in frontend/src/pages/settings/Templates.tsx
- [ ] T200 [UX] [US4] Add "Save as Template" button to DocumentToolbar
- [ ] T201 [US4] Create custom template creation hooks in frontend/src/hooks/useCustomTemplates.ts

### Testing for US4 (OPTIONAL)

- [ ] T202 [P] [TS] [US4] Create custom template creation integration tests in backend/test/integration/templates.e2e.spec.ts
- [ ] T203 [P] [TS] [US4] Create project filtering unit tests in backend/test/unit/projects/filtering.spec.ts
- [ ] T204 [TS] [US4] Create E2E test for multi-project workflow in frontend/tests/e2e/user-story-4.spec.ts

**Checkpoint**: Users can now manage multiple projects efficiently and create reusable templates.

---

## Phase 7: User Story 5 - Context-Aware AI with File Attachments (Priority: P3)

**Goal**: Enhance AI quality by allowing users to provide context through file attachments

**Independent Test**: Can be tested by: (1) Starting a chat, (2) Attaching a spreadsheet with item specifications, (3) Asking AI to generate requirements based on attached file, (4) Seeing AI reference the file content. Delivers convenience and accuracy.

### Database Schema for US5

- [ ] T205 [P] [US5] Define Attachment entity in backend/prisma/schema.prisma
- [ ] T206 [SEC] [US5] Create migration for attachments table with RLS policies
- [ ] T207 [PF] [US5] Create HNSW vector index on attachment.embedding in migration
- [ ] T208 [PF] [US5] Create indexes on (tenant_id, project_id, status) for attachments

### Backend - File Upload (US5)

- [ ] T209 [P] [US5] Install multer for file uploads in backend/package.json
- [ ] T210 [P] [SEC] [US5] Create file upload middleware with validation in backend/src/common/middleware/file-upload.middleware.ts
- [ ] T211 [SEC] [US5] Implement file size validation (max 10MB) in upload middleware
- [ ] T212 [SEC] [US5] Implement MIME type validation in upload middleware
- [ ] T213 [US5] Create Attachments service in backend/src/modules/attachments/attachments.service.ts
- [ ] T214 [US5] Create POST /messages/:messageId/attachments endpoint in backend/src/modules/attachments/attachments.controller.ts
- [ ] T215 [US5] Create Attachments module in backend/src/modules/attachments/attachments.module.ts

### Backend - File Processing (US5)

- [ ] T216 [P] [US5] Install pdf-parse for PDF text extraction in backend/package.json
- [ ] T217 [P] [US5] Install xlsx for spreadsheet parsing in backend/package.json
- [ ] T218 [P] [US5] Install mammoth for DOCX parsing in backend/package.json
- [ ] T219 [P] [US5] Create text extraction service in backend/src/modules/attachments/extraction.service.ts
- [ ] T220 [PF] [US5] Implement async file processing job in Attachments service
- [ ] T221 [PF] [US5] Generate embeddings for extracted text in Attachments service
- [ ] T222 [US5] Implement file content retrieval for AI context in Messages service

### Frontend - File Upload UI (US5)

- [ ] T223 [P] [UX] [US5] Create FileUploadButton component in frontend/src/components/features/FileUploadButton.tsx
- [ ] T224 [P] [UX] [US5] Create AttachmentPreview component in frontend/src/components/features/AttachmentPreview.tsx
- [ ] T225 [P] [UX] [US5] Create UploadProgressIndicator component in frontend/src/components/ui/UploadProgressIndicator.tsx
- [ ] T226 [UX] [US5] Add file upload button to ChatInput component
- [ ] T227 [US5] Create attachment upload hooks in frontend/src/hooks/useAttachments.ts
- [ ] T228 [UX] [US5] Display attached files in ChatMessage component
- [ ] T229 [UX] [US5] Show file processing status in AttachmentPreview

### Testing for US5 (OPTIONAL)

- [ ] T230 [P] [TS] [US5] Create file upload validation unit tests in backend/test/unit/attachments/validation.spec.ts
- [ ] T231 [P] [TS] [US5] Create text extraction unit tests in backend/test/unit/attachments/extraction.spec.ts
- [ ] T232 [TS] [US5] Create file upload integration tests in backend/test/integration/attachments.e2e.spec.ts
- [ ] T233 [TS] [US5] Create E2E test for file attachment flow in frontend/tests/e2e/user-story-5.spec.ts

**Checkpoint**: Users can now attach files to provide context for AI generation.

---

## Phase 8: User Story 6 - Team Collaboration with Roles (Priority: P3)

**Goal**: Enable team collaboration with proper access control for larger organizations

**Independent Test**: Can be tested by: (1) Admin inviting a user, (2) New user accepting invite, (3) Both users viewing same project, (4) Making edits, (5) Seeing each other's changes. Delivers team efficiency.

### Backend - User Invitations (US6)

- [ ] T234 [P] [US6] Create user invitation DTOs in backend/src/modules/users/dto/
- [ ] T235 [P] [US6] Create POST /users/invite endpoint in backend/src/modules/users/users.controller.ts
- [ ] T236 [P] [US6] Implement email invitation service in backend/src/modules/users/invitation.service.ts
- [ ] T237 [US6] Create invitation token generation and validation in Users service
- [ ] T238 [US6] Create GET /users/accept-invite/:token endpoint for invitation acceptance
- [ ] T239 [US6] Create Users module in backend/src/modules/users/users.module.ts

### Backend - User Management (US6)

- [ ] T240 [P] [US6] Create GET /organizations/:orgId/users endpoint for user listing
- [ ] T241 [P] [US6] Create PATCH /users/:id/role endpoint for role changes
- [ ] T242 [P] [US6] Create DELETE /users/:id endpoint for user removal
- [ ] T243 [US6] Implement role-based project access validation in Projects service
- [ ] T244 [US6] Implement role-based document access validation in Documents service

### Frontend - User Management UI (US6)

- [ ] T245 [P] [UX] [US6] Create UserInviteForm component in frontend/src/components/forms/UserInviteForm.tsx
- [ ] T246 [P] [UX] [US6] Create UserListItem component in frontend/src/components/features/UserListItem.tsx
- [ ] T247 [P] [UX] [US6] Create RoleSelector component in frontend/src/components/ui/RoleSelector.tsx
- [ ] T248 [UX] [US6] Create Users management page in frontend/src/pages/settings/Users.tsx
- [ ] T249 [UX] [US6] Create InviteAcceptance page in frontend/src/pages/auth/AcceptInvite.tsx
- [ ] T250 [US6] Create user management hooks in frontend/src/hooks/useUsers.ts

### Frontend - Collaboration Indicators (US6)

- [ ] T251 [P] [UX] [US6] Add "Created by" and "Last edited by" information to DocumentViewer
- [ ] T252 [P] [UX] [US6] Show user avatars in version history in VersionHistoryPanel
- [ ] T253 [UX] [US6] Add role-based UI element visibility throughout application

### Testing for US6 (OPTIONAL)

- [ ] T254 [P] [TS] [US6] Create user invitation unit tests in backend/test/unit/users/invitation.spec.ts
- [ ] T255 [P] [TS] [US6] Create role-based access control unit tests in backend/test/unit/guards/roles.guard.spec.ts
- [ ] T256 [TS] [US6] Create user management integration tests in backend/test/integration/users.e2e.spec.ts
- [ ] T257 [TS] [US6] Create E2E test for collaboration flow in frontend/tests/e2e/user-story-6.spec.ts

**Checkpoint**: Teams can now collaborate with proper access control.

---

## Phase 9: User Story 7 - AI Agent Orchestration Visibility (Priority: P3)

**Goal**: Build user trust and provide transparency into AI document generation process

**Independent Test**: Can be tested by: (1) Initiating document generation, (2) Watching agent status indicators, (3) Seeing progress through each agent phase. Delivers transparency and trust.

### Backend - Agent Status Events (US7)

- [ ] T258 [P] [US7] Create agent status event DTOs in backend/src/modules/ai-agents/dto/
- [ ] T259 [PF] [US7] Implement SSE agent status streaming in Orchestration service
- [ ] T260 [US7] Add agent status emission in Researcher Agent service
- [ ] T261 [P] [US7] Add agent status emission in Validator Agent service
- [ ] T262 [P] [US7] Add agent status emission in Writer Agent service
- [ ] T263 [P] [US7] Add agent status emission in Reviewer Agent service
- [ ] T264 [US7] Create GET /chats/:chatId/agent-status SSE endpoint in Messages controller

### Frontend - Agent Status UI (US7)

- [ ] T265 [P] [UX] [US7] Enhance AgentStatusIndicator with detailed agent information
- [ ] T266 [P] [UX] [US7] Create AgentProgressBar component in frontend/src/components/features/AgentProgressBar.tsx
- [ ] T267 [P] [UX] [US7] Create AgentErrorDisplay component in frontend/src/components/features/AgentErrorDisplay.tsx
- [ ] T268 [UX] [US7] Add agent status subscription to ChatInterface
- [ ] T269 [UX] [US7] Display friendly agent status messages ("Researcher Agent: Searching for relevant laws")
- [ ] T270 [US7] Add stop generation button to ChatInterface

### Testing for US7 (OPTIONAL)

- [ ] T271 [P] [TS] [US7] Create agent status streaming unit tests in backend/test/unit/ai-agents/status.spec.ts
- [ ] T272 [TS] [US7] Create E2E test for agent visibility flow in frontend/tests/e2e/user-story-7.spec.ts

**Checkpoint**: Users now have full visibility into AI agent work.

---

## Phase 10: User Story 8 - Smart Search Across Project History (Priority: P3)

**Goal**: Enable knowledge reuse across project history through semantic search

**Independent Test**: Can be tested by: (1) Creating multiple documents and chats, (2) Using search to find specific term, (3) Seeing results across all project content. Delivers knowledge reuse.

### Database Schema for US8

- [ ] T273 [PF] [US8] Verify vector indexes exist on documents, messages, attachments embeddings

### Backend - Search Service (US8)

- [ ] T274 [P] [US8] Create search DTOs in backend/src/modules/search/dto/
- [ ] T275 [US8] Create Search service with pgvector similarity queries in backend/src/modules/search/search.service.ts
- [ ] T276 [PF] [US8] Implement hybrid search (keyword + semantic) in Search service
- [ ] T277 [US8] Create GET /projects/:projectId/search endpoint in backend/src/modules/search/search.controller.ts
- [ ] T278 [US8] Create Search module in backend/src/modules/search/search.module.ts

### Backend - RAG Context Retrieval (US8)

- [ ] T279 [US8] Implement context retrieval from previous chats in Messages service
- [ ] T280 [US8] Implement context retrieval from previous documents in Messages service
- [ ] T281 [US8] Implement context retrieval from attachments in Messages service
- [ ] T282 [PF] [US8] Add relevance threshold filtering (e.g., similarity > 0.7) in Search service

### Frontend - Search UI (US8)

- [ ] T283 [P] [UX] [US8] Create SearchBar component in frontend/src/components/features/SearchBar.tsx
- [ ] T284 [P] [UX] [US8] Create SearchResults component in frontend/src/components/features/SearchResults.tsx
- [ ] T285 [P] [UX] [US8] Create SearchResultItem component in frontend/src/components/features/SearchResultItem.tsx
- [ ] T286 [UX] [US8] Add search bar to ProjectDetail page
- [ ] T287 [UX] [US8] Implement search result highlighting in SearchResultItem
- [ ] T288 [UX] [US8] Add "No results" empty state in SearchResults
- [ ] T289 [US8] Create search hooks in frontend/src/hooks/useSearch.ts

### Testing for US8 (OPTIONAL)

- [ ] T290 [P] [TS] [US8] Create semantic search unit tests in backend/test/unit/search/search.service.spec.ts
- [ ] T291 [P] [TS] [US8] Create RAG context retrieval unit tests in backend/test/unit/messages/context.spec.ts
- [ ] T292 [TS] [US8] Create search integration tests in backend/test/integration/search.e2e.spec.ts
- [ ] T293 [TS] [US8] Create E2E test for search flow in frontend/tests/e2e/user-story-8.spec.ts

**Checkpoint**: All 8 user stories are now complete and independently functional!

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### Security & Audit Logging

- [ ] T294 [P] [SEC] Define AuditLog entity in backend/prisma/schema.prisma
- [ ] T295 [SEC] Create migration for audit_logs table with RLS policies
- [ ] T296 [SEC] Create audit logging service in backend/src/modules/audit/audit.service.ts
- [ ] T297 [SEC] Add audit logging to all data modification endpoints
- [ ] T298 [P] [SEC] Implement CSRF protection for state-changing operations
- [ ] T299 [P] [SEC] Add rate limiting middleware in backend/src/common/middleware/rate-limit.middleware.ts

### Performance Optimization

- [ ] T300 [P] [PF] Implement code-splitting by route in frontend/vite.config.ts
- [ ] T301 [P] [PF] Add lazy loading for large components in frontend/src/App.tsx
- [ ] T302 [P] [PF] Optimize images to WebP format in frontend/public/
- [ ] T303 [PF] Add database query performance monitoring in backend/src/prisma/prisma.service.ts
- [ ] T304 [PF] Implement response caching for templates endpoint
- [ ] T305 [P] [PF] Add bundle size analysis script to frontend/package.json

### Error Handling & Monitoring

- [ ] T306 [P] Create error tracking service integration in backend/src/common/services/error-tracking.service.ts
- [ ] T307 [P] Add global error boundary in frontend/src/components/ErrorBoundary.tsx
- [ ] T308 Implement health check endpoint in backend/src/health/health.controller.ts
- [ ] T309 [P] Add database connection monitoring in health check

### User Experience Polish

- [ ] T310 [P] [UX] Add loading skeleton screens throughout frontend
- [ ] T311 [P] [UX] Implement toast notifications system in frontend/src/components/ui/Toast.tsx
- [ ] T312 [P] [UX] Add confirmation modals for destructive actions
- [ ] T313 [UX] Implement keyboard shortcuts documentation page
- [ ] T314 [UX] Add tooltips for complex features
- [ ] T315 [P] [UX] Ensure all forms have proper validation error messages

### Documentation

- [ ] T316 [P] Create API documentation using Swagger in backend/src/main.ts
- [ ] T317 [P] Write deployment guide in docs/deployment.md
- [ ] T318 [P] Write development setup guide in docs/development.md
- [ ] T319 Create user guide for procurement officers in docs/user-guide.md
- [ ] T320 Document environment variables in backend/.env.example and frontend/.env.example

### Testing & Quality Assurance

- [ ] T321 [P] [TS] Setup test coverage reporting in backend/jest.config.js
- [ ] T322 [P] [TS] Setup test coverage reporting in frontend/vitest.config.ts
- [ ] T323 [TS] Run quickstart.md validation following all setup steps
- [ ] T324 [TS] Perform cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T325 [TS] Perform accessibility audit using axe DevTools
- [ ] T326 [TS] Perform security audit of all endpoints

### Deployment Preparation

- [ ] T327 Create production Docker Compose configuration in docker-compose.prod.yml
- [ ] T328 [P] Create database backup script in backend/scripts/backup.sh
- [ ] T329 [P] Setup database migration strategy for production
- [ ] T330 Configure SSL/TLS for production deployment
- [ ] T331 [P] Setup environment-specific configuration management
- [ ] T332 Create CI/CD pipeline configuration (GitHub Actions or similar)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP baseline
- **User Stories 2-8 (Phases 4-10)**: All depend on Foundational completion
  - Can proceed in parallel (if staffed) OR sequentially in priority order
  - Minimal cross-story dependencies (designed for independence)
- **Polish (Phase 11)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) ✓ Independent
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) ✓ Independent (integrates with US1 document viewing)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) ✓ Independent (uses US1 document structure)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) ✓ Independent (enhances US1 project/template features)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) ✓ Independent (enhances US1 chat feature)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) ✓ Independent (adds collaboration to US1)
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) ✓ Independent (enhances US1 AI transparency)
- **User Story 8 (P3)**: Can start after Foundational (Phase 2) ✓ Independent (adds search across US1 content)

### Within Each User Story

1. Database schema first (migrations with RLS)
2. Backend services (business logic with tenant isolation)
3. Backend controllers (API endpoints)
4. Frontend components (UI following UX principles)
5. Frontend hooks and state management
6. Integration and testing (if included)

### Parallel Opportunities

**Phase 1 - Setup**: T002-T007, T009-T010, T011-T012 can all run in parallel

**Phase 2 - Foundational**:
- T016-T018 (entity definitions) can run in parallel
- T024-T025, T026-T028, T029-T030 (auth components) can run in parallel
- T037-T039 (API infrastructure) can run in parallel
- T041-T048 (frontend infrastructure) can run in parallel
- T049-T051 (shared types) can run in parallel

**Phase 3 - User Story 1**:
- T052-T057 (all entity definitions) can run in parallel
- T077-T080 (all AI agents) can run in parallel
- T101-T102, T103-T104 (auth pages) can run in parallel
- All frontend component creation tasks marked [P] can run in parallel

**Multiple User Stories**: Once Phase 2 completes, ALL user stories (Phase 3-10) can be worked on in parallel by different team members

---

## Parallel Execution Examples

### User Story 1 Database Setup
```bash
# All entity definitions can happen simultaneously:
Task T052: "Define Project entity in backend/prisma/schema.prisma"
Task T053: "Define Template entity in backend/prisma/schema.prisma"
Task T054: "Define Document entity in backend/prisma/schema.prisma"
Task T055: "Define DocumentVersion entity in backend/prisma/schema.prisma"
Task T056: "Define Chat entity in backend/prisma/schema.prisma"
Task T057: "Define Message entity in backend/prisma/schema.prisma"
```

### User Story 1 AI Agents
```bash
# All specialized agents can be built simultaneously:
Task T077: "Create Researcher Agent service in backend/src/modules/ai-agents/researcher.service.ts"
Task T078: "Create Validator Agent service in backend/src/modules/ai-agents/validator.service.ts"
Task T079: "Create Writer Agent service in backend/src/modules/ai-agents/writer.service.ts"
Task T080: "Create Reviewer Agent service in backend/src/modules/ai-agents/reviewer.service.ts"
```

### Multiple User Stories in Parallel
```bash
# With 3 developers after Phase 2 completes:
Developer A: User Story 1 (Phase 3) - MVP
Developer B: User Story 2 (Phase 4) - Document Refinement
Developer C: User Story 5 (Phase 7) - File Attachments
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended Approach

1. **Complete Phase 1: Setup** (~2-3 days)
   - Create project structure
   - Initialize dependencies
   - Configure tooling

2. **Complete Phase 2: Foundational** (~5-7 days) ⚠️ CRITICAL
   - Database with RLS
   - Authentication/authorization
   - API infrastructure
   - Frontend infrastructure
   - **CHECKPOINT**: Foundation must be solid before proceeding

3. **Complete Phase 3: User Story 1** (~10-15 days)
   - All 82 tasks (T052-T133)
   - **CHECKPOINT**: Test complete end-to-end flow
   - **DELIVERABLE**: Working MVP - users can generate documents!

4. **STOP and VALIDATE**: Deploy MVP, gather feedback

### Incremental Delivery (Recommended for Production)

1. **Foundation** (Phases 1-2) → Foundation ready (~7-10 days)
2. **+ User Story 1** (Phase 3) → Deploy MVP! (~17-25 days total)
3. **+ User Story 2** (Phase 4) → Deploy document editing (~22-30 days total)
4. **+ User Story 3** (Phase 5) → Deploy version history (~25-33 days total)
5. **+ User Story 4** (Phase 6) → Deploy multi-project support (~28-36 days total)
6. **+ User Stories 5-8** (Phases 7-10) → Deploy remaining features (~40-50 days total)
7. **+ Polish** (Phase 11) → Production ready (~45-55 days total)

Each increment adds value without breaking previous features!

### Parallel Team Strategy (3+ Developers)

1. **Week 1-2**: Entire team on Phases 1-2 (Setup + Foundational)
2. **Week 3-4**: Split team after Phase 2 completes:
   - Dev A: User Story 1 (P1) - Critical path
   - Dev B: User Story 2 (P2) - Can start immediately
   - Dev C: User Story 5 (P3) - Independent feature
3. **Week 5-6**: Continue parallel development
4. **Week 7**: Integration and testing
5. **Week 8**: Polish and deployment prep

---

## Summary

- **Total Tasks**: 332 tasks
- **Total User Stories**: 8 (P1: 1 story, P2: 3 stories, P3: 4 stories)
- **Task Breakdown by Phase**:
  - Phase 1 (Setup): 15 tasks
  - Phase 2 (Foundational): 36 tasks (BLOCKING)
  - Phase 3 (US1 - MVP): 82 tasks ⭐
  - Phase 4 (US2): 20 tasks
  - Phase 5 (US3): 16 tasks
  - Phase 6 (US4): 22 tasks
  - Phase 7 (US5): 29 tasks
  - Phase 8 (US6): 24 tasks
  - Phase 9 (US7): 15 tasks
  - Phase 10 (US8): 21 tasks
  - Phase 11 (Polish): 52 tasks

- **Independent Test Criteria**: Each user story has clear test criteria for independent validation
- **Parallel Opportunities**: 150+ tasks marked [P] can run in parallel
- **MVP Scope**: Phases 1-3 (133 tasks) deliver complete working platform
- **Constitution Compliance**: All tasks follow code quality, testing, UX, performance, and security principles

**Format Validation**: ✓ All tasks follow strict checklist format with checkbox, ID, optional [P] marker, [Story] label (where applicable), and file paths.

---

## Notes

- Tasks marked [P] work on different files with no dependencies
- Tasks marked with story labels (e.g., [US1], [US2]) map to specific user stories from spec.md
- Each user story phase is independently completable and testable
- Testing tasks are included but optional - prioritize implementation for MVP
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently before proceeding
- User Story 1 (Phase 3) is the recommended MVP - delivers complete value proposition
- All subsequent user stories add value without breaking US1
