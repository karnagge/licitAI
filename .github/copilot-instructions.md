# licitAI Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-04

## Active Technologies

**Frontend Stack:**
- React 18+ with TypeScript (strict mode)
- Vite (build tool)
- TailwindCSS (styling)
- TanStack Query / React Query (server state)
- React Router (routing)
- Radix UI (base components)
- Zod (validation)
- React Hook Form (forms)
- Lucide React (icons)

**Backend Stack:**
- Node.js 20+ LTS with NestJS framework
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL 15+ with pgvector extension
- Passport.js (authentication - JWT)
- Class-validator (DTO validation)
- Socket.io (WebSockets for future features)

**AI & Agent Orchestration:**
- Claude Agent SDK (Anthropic)
- Claude API (claude-sonnet-4-20250514 model)
- pgvector for embeddings (RAG functionality)

**Infrastructure:**
- Docker Compose (local development and deployment)
- PostgreSQL with Row-Level Security (RLS) for multitenant isolation

## Project Structure

```text
licitAI/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/    # React components (atoms → molecules → organisms → pages)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client (TanStack Query)
│   │   └── types/         # TypeScript types
│   └── tests/             # Frontend tests (Vitest, Playwright)
│
├── backend/               # NestJS application
│   ├── src/
│   │   ├── modules/       # Feature modules (auth, organizations, projects, documents, chats, ai-agents)
│   │   ├── common/        # Shared guards, interceptors, decorators
│   │   ├── prisma/        # Database schema & migrations
│   │   └── main.ts
│   └── test/              # Backend tests (Jest, Supertest)
│
└── shared/                # Shared TypeScript types between FE/BE
    └── types/
```

## Commands

**Development:**
```bash
# Start full stack with Docker Compose
docker-compose up

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Database migrations
cd backend && npx prisma migrate dev --name <description>

# Prisma Studio (database GUI)
cd backend && npx prisma studio
```

**Testing:**
```bash
# Backend tests
cd backend && npm run test        # Unit tests
cd backend && npm run test:e2e    # Integration tests

# Frontend tests
cd frontend && npm run test       # Unit tests
cd frontend && npm run test:e2e   # E2E tests (Playwright)
```

## Code Style

**TypeScript Configuration:**
- Strict mode enabled (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`)
- Absolute imports using path mapping
- All code must be typed, no `any` without explicit justification

**Component Structure:**
- React functional components with hooks only (no class components)
- Component hierarchy: atoms → molecules → organisms → pages
- JSDoc comments required for complex components

**Architecture Principles:**
- Monolithic architecture with clear layer separation
- Multitenant isolation enforced at database (RLS) and application level
- All database queries must include `tenant_id` in WHERE clause
- RESTful API design with nested routes: `/orgs/:orgId/projects/:projectId/...`

**Naming Conventions:**
- Domain models: Organization, Project, Template, Chat, Document (meaningful names)
- Files: kebab-case (e.g., `document-version.service.ts`)
- Components: PascalCase (e.g., `DocumentEditor.tsx`)
- Functions: camelCase (e.g., `generateDocument()`)

**Code Organization:**
- UI components in `/components/ui`
- Business logic in custom hooks
- API calls through TanStack Query
- Shared types in `/shared/types`

## Recent Changes

- 001-procurement-saas-platform: Added

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
