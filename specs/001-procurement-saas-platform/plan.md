# Implementation Plan: Brazilian Procurement Document Generation Platform

**Branch**: `001-procurement-saas-platform` | **Date**: November 3, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-procurement-saas-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a multitenant SaaS platform that helps Brazilian public institutions automatically generate procurement documents (Technical Preliminary Studies, bidding notices, contracts) using AI agent orchestration. Users describe procurement needs in natural language, and specialized AI agents (Researcher, Validator, Writer, Reviewer) collaborate to produce compliant documents following Lei 14.133/2021. Platform features include project management, template system, conversational chat interface, document versioning, and semantic search. Technical approach uses monolithic architecture with React/TypeScript frontend, NestJS backend, PostgreSQL with pgvector for RAG, and Claude Agent SDK for multi-agent orchestration.

## Technical Context

**Language/Version**: 
- Frontend: TypeScript 5.0+ with React 18+ (strict mode enabled)
- Backend: TypeScript 5.0+ with Node.js 20+ LTS
- Database: PostgreSQL 15+ with pgvector extension

**Primary Dependencies**: 
- Frontend: Vite (build), TailwindCSS (styling), TanStack Query (state), React Router (routing), Radix UI (components), Zod (validation), Lucide React (icons)
- Backend: NestJS (framework), Prisma (ORM), Passport.js (auth), Class-validator (validation), Socket.io (WebSockets)
- AI: Claude Agent SDK (Anthropic), Claude API (claude-sonnet-4-20250514 model)

**Storage**: 
- Database: PostgreSQL 15+ with Row-Level Security (RLS) for tenant isolation
- Vector Store: pgvector extension for document embeddings (RAG functionality)
- File Storage: Local filesystem organized by /uploads/:tenant_id/:project_id/:file_id (max 10MB per file)
- Session: JWT-based with refresh tokens (no Redis for MVP)

**Testing**: 
- Backend: Jest (unit), Supertest (API integration)
- Frontend: Vitest (unit), React Testing Library (component)
- E2E: Playwright (critical user flows)
- Mock strategy: Fixed responses for Claude API calls in test environment

**Target Platform**: 
- Linux server deployment using Docker Compose
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Desktop/laptop primary (mobile optimization deferred)

**Project Type**: Web application (monolithic architecture with clear layer separation)

**Performance Goals**: 
- Page load: <3 seconds on standard broadband
- UI interactions: <100ms perceived delay
- AI streaming: start within 2 seconds
- Database queries: indexed on tenant_id, project_id
- Bundle size: <500KB initial load
- Support: 100+ concurrent users

**Constraints**: 
- Multitenant data isolation enforced at DB (RLS) and application level
- LGPD compliance for Brazilian data protection
- WCAG AA accessibility standards
- Single language: Brazilian Portuguese
- No real-time collaborative editing (version control instead)
- No external integrations in MVP

**Scale/Scope**: 
- First year estimate: 1,000 organizations, 10,000 projects, 50,000 documents
- 8 user stories covering organization setup, document generation, refinement, versioning, templates, file attachments, collaboration, and search
- Core entities: Organization, User, Project, Template, Document, Version, Chat, Message, Attachment, AuditLog
- 67 functional requirements, 25 UX requirements, 9 performance requirements, 10 security requirements
- Phased implementation: 7 phases from authentication to collaborative features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality Compliance**:
- [x] TypeScript strict mode configuration verified (strict: true, noImplicitAny: true, strictNullChecks: true in both frontend and backend)
- [x] Component hierarchy follows atoms → molecules → organisms → pages (specified in UX requirements and technical stack)
- [x] Multitenant isolation with tenant_id implemented (FR-001, FR-004, SEC-001 enforce tenant_id in all tables with RLS)
- [x] JSDoc comments planned for complex components (Constitution I mandates this for complex components)

**Testing Standards Compliance**:
- [x] Unit tests planned for business logic and tenant isolation (Jest for backend, Vitest for frontend testing tenant isolation logic)
- [x] Integration tests planned for AI document generation flow (Supertest for API integration testing the complete agent orchestration workflow)
- [x] E2E tests planned for main user journey (Playwright for User Story 1: Create Organization → Project → Template → Generate Document)
- [x] Claude API mocking strategy defined (Mock Claude API with fixed responses in test environment, per testing strategy)

**UX Consistency Compliance**:
- [x] Minimalist interface design approach confirmed (UX-001: show only essential information and actions)
- [x] Consistent spacing system (4px, 8px, 16px, 24px, 32px, 48px) planned (UX-002 explicitly defines this scale)
- [x] Progressive disclosure pattern identified (UX-004: show basic options first, advanced on demand; applied to templates, settings)
- [x] WCAG AA accessibility requirements addressed (UX-007: 4.5:1 contrast ratio minimum, semantic HTML, keyboard navigation)

**Performance Requirements Compliance**:
- [x] Page load <3 seconds target confirmed (PF-001: initial page load under 3 seconds on standard broadband)
- [x] Real-time AI streaming implementation planned (Server-Sent Events for streaming responses, FR-023, PF-007)
- [x] Database indexing strategy on tenant_id/project_id defined (PF-003: all queries include tenant_id in WHERE with proper indexes)
- [x] Bundle size optimization strategy (<500KB) planned (PF-005: code-splitting by route, lazy loading, WebP images)

**Security & Multitenant Compliance**:
- [x] PostgreSQL RLS policies planned (SEC-001, FR-062: Row Level Security enforces tenant isolation at database level)
- [x] Audit logging for document changes designed (FR-063, SEC-002: AuditLog entity tracks who, what, when for all data modifications)
- [x] Input validation before AI API calls confirmed (FR-064, SEC-003: Class-validator for DTOs, Zod for frontend forms)
- [x] Environment variable usage for secrets verified (FR-065, SEC-004: .env files for API keys, database credentials, never in code)

**Constitution Compliance Assessment**: ✅ **PASSED** - All non-negotiable principles from Constitution v1.0.0 are addressed in the technical specifications. No conflicts detected.

---

**Post-Design Re-Verification (Phase 1 Complete)**:

After completing research, data model, and API contracts, all constitution requirements remain satisfied:

- ✅ **Code Quality**: Data model enforces tenant_id on all entities. Prisma schema uses strict typing. API contracts follow REST conventions with clear resource hierarchy.
- ✅ **Testing**: Data model includes AuditLog for testing audit trails. API contracts define error responses for test assertions. Test strategy covers all three tiers.
- ✅ **UX**: API contracts include pagination for performance. Error responses are user-friendly. Quickstart guide ensures developer experience consistency.
- ✅ **Performance**: Database indexes documented in data model. Vector indexes on embeddings for fast RAG. SSE streaming in API contracts.
- ✅ **Security**: RLS policies defined for each entity. Audit logging enforced. JWT authentication in API contracts. File upload size limits documented.

**Final Assessment**: ✅ **CONSTITUTION COMPLIANT** - Design artifacts (research.md, data-model.md, contracts/) align with all non-negotiable principles. Ready to proceed to implementation.

---

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
licitAI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Atoms: Button, Input, Card, Modal, Tooltip
│   │   │   ├── forms/           # Molecules: LoginForm, ProjectForm, TemplateForm
│   │   │   ├── features/        # Organisms: ChatInterface, DocumentEditor, VersionHistory
│   │   │   └── layouts/         # Pages: DashboardLayout, ProjectLayout
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── dashboard/       # OrganizationDashboard, ProjectList
│   │   │   ├── projects/        # ProjectDetail, DocumentView, TemplateSelection
│   │   │   └── settings/        # OrganizationSettings, UserProfile
│   │   ├── hooks/               # Custom React hooks for business logic
│   │   ├── services/            # API client functions (TanStack Query)
│   │   ├── types/               # TypeScript interfaces and types
│   │   ├── utils/               # Helper functions, formatting, validation
│   │   ├── styles/              # Global CSS, Tailwind config
│   │   └── main.tsx             # App entry point
│   ├── tests/
│   │   ├── unit/                # Component unit tests (Vitest)
│   │   ├── integration/         # Feature integration tests
│   │   └── e2e/                 # End-to-end tests (Playwright)
│   ├── public/                  # Static assets
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # Authentication module (JWT, Passport)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── strategies/   # JWT, Local strategies
│   │   │   │   └── dto/          # Login, Register DTOs
│   │   │   ├── organizations/   # Organization CRUD
│   │   │   ├── users/           # User management
│   │   │   ├── projects/        # Project CRUD
│   │   │   ├── templates/       # Template management
│   │   │   ├── documents/       # Document generation, versioning
│   │   │   ├── chats/           # Chat conversations
│   │   │   ├── messages/        # Chat messages
│   │   │   ├── attachments/     # File upload handling
│   │   │   ├── ai-agents/       # Agent orchestration
│   │   │   │   ├── researcher.service.ts
│   │   │   │   ├── validator.service.ts
│   │   │   │   ├── writer.service.ts
│   │   │   │   └── reviewer.service.ts
│   │   │   └── search/          # Semantic search with pgvector
│   │   ├── common/
│   │   │   ├── guards/          # RLS enforcement, role guards
│   │   │   ├── interceptors/    # Logging, error handling
│   │   │   ├── filters/         # Exception filters
│   │   │   └── decorators/      # Custom decorators (CurrentUser, etc)
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Database schema with RLS
│   │   │   └── migrations/      # Prisma migrations
│   │   ├── config/              # Configuration modules
│   │   ├── utils/               # Helper functions
│   │   └── main.ts              # App entry point
│   ├── test/
│   │   ├── unit/                # Service unit tests (Jest)
│   │   ├── integration/         # API integration tests (Supertest)
│   │   └── fixtures/            # Test data, mocks
│   ├── uploads/                 # Local file storage (gitignored)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── shared/
│   └── types/                   # Shared TypeScript types between FE/BE
│       ├── entities.ts          # Organization, User, Project, etc
│       ├── dtos.ts              # API request/response types
│       └── enums.ts             # Shared enums (roles, statuses)
│
├── docker-compose.yml           # Docker Compose for local dev and prod
├── .env.example                 # Root environment variables
├── .gitignore
├── .prettierrc
├── .eslintrc.json
└── README.md
```

**Structure Decision**: Monolithic web application with clear separation between frontend (React + Vite), backend (NestJS), and shared types. This structure supports the MVP requirements while maintaining simplicity and allowing future scaling.

## Complexity Tracking

No constitution violations detected. All design decisions align with non-negotiable principles:
- Monolithic architecture chosen for MVP simplicity (not microservices over-engineering)
- PostgreSQL RLS for tenant isolation (database-level security)
- JWT authentication (stateless, scalable)
- TanStack Query for state management (no Redux complexity)
- Local file storage with S3 migration path (pragmatic for MVP)

All complexity is justified by functional requirements and aligns with constitution principles.
