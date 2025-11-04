# Quickstart Guide: Brazilian Procurement Document Generation Platform

**Feature**: `001-procurement-saas-platform`  
**Date**: November 3, 2025  
**For**: Development Team

## Overview

This quickstart guide provides step-by-step instructions to set up the development environment and begin implementing the procurement SaaS platform. Follow these instructions in order for a smooth setup.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20+ LTS ([Download](https://nodejs.org/))
- **PostgreSQL**: Version 15+ ([Download](https://www.postgresql.org/download/))
- **Docker & Docker Compose**: For containerized development ([Download](https://www.docker.com/))
- **Git**: Version control
- **VS Code** (recommended): With extensions:
  - Prisma
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url> licitAI
cd licitAI
git checkout 001-procurement-saas-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies (if any workspace tools)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up PostgreSQL Database

**Option A: Using Docker Compose (Recommended)**

```bash
# From project root
docker-compose up -d postgres

# This starts PostgreSQL with pgvector extension
```

**Option B: Local PostgreSQL Installation**

```bash
# Install pgvector extension
sudo apt-get install postgresql-15-pgvector  # Ubuntu/Debian
brew install pgvector  # macOS

# Connect to PostgreSQL
psql -U postgres

# Create database and enable pgvector
CREATE DATABASE licitai_dev;
\c licitai_dev
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 4. Configure Environment Variables

**Backend `.env`**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/licitai_dev?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Claude API
CLAUDE_API_KEY="sk-ant-api03-xxxxx"  # Get from https://console.anthropic.com/
CLAUDE_MODEL="claude-sonnet-4-20250514"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=10

# Server
PORT=3000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

**Frontend `.env`**

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL="http://localhost:3000/v1"

# Environment
VITE_ENV="development"
```

### 5. Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with system templates
npx prisma db seed
```

---

## Development Workflow

### Running the Application

**Option 1: Using Docker Compose (Full Stack)**

```bash
# From project root
docker-compose up

# Access:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000
# - PostgreSQL: localhost:5432
```

**Option 2: Running Services Separately**

```bash
# Terminal 1: Run backend
cd backend
npm run dev

# Terminal 2: Run frontend
cd frontend
npm run dev

# Terminal 3: PostgreSQL (if not using Docker)
# Already running from setup step
```

### Verify Setup

1. **Backend health check**:
   ```bash
   curl http://localhost:3000/health
   # Expected: {"status":"ok","database":"connected"}
   ```

2. **Frontend**: Open http://localhost:5173
   - Should see login/register page
   - No console errors

3. **Database connection**:
   ```bash
   cd backend
   npx prisma studio
   ```
   - Opens Prisma Studio at http://localhost:5555
   - You should see all database tables

---

## Project Structure Explained

```
licitAI/
├── backend/                    # NestJS backend application
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Authentication (JWT, Passport)
│   │   │   ├── organizations/ # Organization CRUD
│   │   │   ├── projects/      # Project management
│   │   │   ├── documents/     # Document generation
│   │   │   ├── chats/         # Chat conversations
│   │   │   └── ai-agents/     # AI agent orchestration
│   │   ├── common/            # Shared guards, interceptors
│   │   ├── prisma/            # Database schema & migrations
│   │   └── main.ts            # Application entry point
│   ├── test/                  # Tests
│   └── uploads/               # Local file storage (gitignored)
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── forms/         # Form components
│   │   │   └── features/      # Feature-specific components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client (TanStack Query)
│   │   └── types/             # TypeScript types
│   └── tests/                 # Frontend tests
│
├── shared/                     # Shared types between FE/BE
│   └── types/
│
└── docker-compose.yml          # Docker orchestration
```

---

## Development Guidelines

### Code Style

- **TypeScript strict mode**: Enforced in both frontend and backend
- **ESLint + Prettier**: Auto-format on save
- **Conventional commits**: Use format `type(scope): message`
  - Examples: `feat(auth): add JWT refresh token`, `fix(documents): handle null template`

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/auth-module

# Make changes, commit frequently
git add .
git commit -m "feat(auth): implement JWT authentication"

# Push and create PR
git push origin feat/auth-module
```

### Testing

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:cov          # With coverage

# Frontend tests
cd frontend
npm run test              # Unit tests
npm run test:ui           # Interactive test UI
npm run test:e2e          # E2E tests (Playwright)
```

### Database Changes

```bash
# After modifying prisma/schema.prisma
cd backend

# Create migration
npx prisma migrate dev --name descriptive-name

# Apply migration to production
npx prisma migrate deploy
```

---

## Phase 1 Implementation Plan

Follow this order for initial implementation:

### Week 1: Foundation
- [ ] Set up project structure (backend, frontend, shared)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Docker Compose
- [ ] Create Prisma schema with RLS policies
- [ ] Run initial migrations

### Week 2: Authentication (Phase 1)
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint with JWT
- [ ] Implement refresh token logic
- [ ] Create authentication guards
- [ ] Build login/register UI components
- [ ] Write authentication tests

### Week 3: Organizations & Users CRUD
- [ ] Implement organization management endpoints
- [ ] Implement user invitation flow
- [ ] Build organization dashboard UI
- [ ] Build user management UI
- [ ] Test tenant isolation

### Week 4: Projects CRUD (Phase 2)
- [ ] Implement project endpoints
- [ ] Build project list UI
- [ ] Build project detail UI
- [ ] Implement project status transitions
- [ ] Write project tests

---

## Common Development Tasks

### Adding a New Module

```bash
# Backend (NestJS)
cd backend
npx nest generate module modules/feature-name
npx nest generate controller modules/feature-name
npx nest generate service modules/feature-name
```

### Adding a New Database Table

1. Edit `backend/src/prisma/schema.prisma`
2. Add model with proper relationships and RLS
3. Run migration:
   ```bash
   npx prisma migrate dev --name add-feature-table
   ```

### Creating API Endpoints

```typescript
// backend/src/modules/feature/feature.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('feature')
@UseGuards(JwtAuthGuard)
export class FeatureController {
  constructor(private featureService: FeatureService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    return this.featureService.findAll(user.tenantId);
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateFeatureDto) {
    return this.featureService.create(user.tenantId, dto);
  }
}
```

### Consuming API in Frontend

```typescript
// frontend/src/services/api/feature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const useFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: () => api.get('/feature'),
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFeatureDto) => api.post('/feature', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Prisma Migration Errors

```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Apply migrations manually
npx prisma migrate deploy
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### TypeScript Errors

```bash
# Rebuild Prisma client
cd backend
npx prisma generate

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Frontend Build Issues

```bash
cd frontend

# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Testing Strategy

### Unit Tests

Test individual functions and services in isolation.

```typescript
// backend/test/unit/document-version.service.spec.ts
describe('DocumentVersionService', () => {
  it('should create new version with incremented number', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Test API endpoints with real database.

```typescript
// backend/test/integration/projects.e2e-spec.ts
describe('Projects API (Integration)', () => {
  it('should enforce tenant isolation', async () => {
    // Test tenant isolation
  });
});
```

### E2E Tests

Test complete user flows.

```typescript
// frontend/tests/e2e/document-generation.spec.ts
test('User Story 1: Generate document end-to-end', async ({ page }) => {
  await page.goto('/register');
  // Complete flow test
});
```

---

## Next Steps

After completing Phase 1 (Authentication + Organizations + Projects):

1. **Phase 2**: Implement Templates CRUD
2. **Phase 3**: Build Chat Interface
3. **Phase 4**: Integrate Claude Agent SDK for AI generation
4. **Phase 5**: Implement RAG with pgvector
5. **Phase 6**: Add Document Versioning
6. **Phase 7**: Build Rich Text Editor

Refer to `/specs/001-procurement-saas-platform/plan.md` for detailed implementation plan.

---

## Resources

- **Spec Document**: `specs/001-procurement-saas-platform/spec.md`
- **Research**: `specs/001-procurement-saas-platform/research.md`
- **Data Model**: `specs/001-procurement-saas-platform/data-model.md`
- **API Contracts**: `specs/001-procurement-saas-platform/contracts/api-spec.yaml`
- **NestJS Docs**: https://docs.nestjs.com/
- **Prisma Docs**: https://www.prisma.io/docs/
- **React Query Docs**: https://tanstack.com/query/latest
- **Claude API Docs**: https://docs.anthropic.com/

---

## Support

If you encounter issues not covered in this guide:

1. Check the troubleshooting section above
2. Review relevant documentation links
3. Check GitHub issues for similar problems
4. Ask in team chat for assistance

**Happy coding!** 🚀
