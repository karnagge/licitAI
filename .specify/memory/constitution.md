<!--
Sync Impact Report:
- Version change: INITIAL → 1.0.0
- Initial constitution creation with 5 core principles
- Added sections: Code Quality Standards, User Experience Requirements, Performance Standards
- Templates requiring updates: ✅ All templates validated for alignment
- No follow-up TODOs - all placeholders filled
-->

# LicitAI Constitution

## Core Principles

### I. Code Quality First (NON-NEGOTIABLE)
TypeScript with strict mode MUST be enforced across all components. React functional components with hooks are MANDATORY. Clear separation MUST exist between UI components → API routes → Database layers. Multitenant isolation MUST be implemented from day one with tenant_id in all database tables. Domain models MUST use meaningful names: Organization, Project, Template, Chat, Document. Component structure MUST follow atoms → molecules → organisms → pages hierarchy. JSDoc comments are REQUIRED for complex components.

**Rationale**: Code quality directly impacts maintainability, security (especially tenant isolation), and team velocity. Strict typing prevents runtime errors in production.

### II. Testing Standards (NON-NEGOTIABLE)
Unit tests are REQUIRED for critical business logic including tenant isolation and template validation. Integration tests MUST cover the AI document generation flow. End-to-end tests MUST validate the complete user journey: Create Organization → Project → Template → Generate Document. Document versioning (create, edit, rollback) MUST be tested. Database queries MUST be tested for tenant data isolation. Claude API calls MUST be mocked in tests.

**Rationale**: Testing ensures system reliability and prevents data leakage between tenants, which is critical for a multitenant SaaS platform.

### III. User Experience Consistency (NON-NEGOTIABLE)
Minimalist interface design MUST be maintained - show only necessary elements. Generous white space and consistent spacing system (4px, 8px, 16px, 24px, 32px, 48px) are REQUIRED. Rounded corners (8px cards, 6px buttons) and subtle shadows (shadow-sm, shadow-md) MUST be used consistently. Typography hierarchy MUST be clear with minimum 16px body text. Progressive disclosure pattern MUST be implemented. Clear call-to-action buttons with action verbs are REQUIRED. Accessibility standards (WCAG AA) MUST be met.

**Rationale**: Consistent UX builds user trust and reduces cognitive load, critical for user adoption in the procurement domain.

### IV. Performance Requirements (NON-NEGOTIABLE)
Page load times MUST be under 3 seconds. UI interactions MUST feel instant (<100ms perceived delay). AI responses MUST stream in real-time with no blank waiting screens. Animations MUST run at 60fps using CSS transitions/transforms. Optimistic UI updates are REQUIRED. Database queries MUST use indexes on tenant_id and project_id. Bundle size MUST remain under 500KB for initial load. Lists with 20+ items MUST be paginated.

**Rationale**: Performance directly impacts user satisfaction and system scalability. Poor performance leads to user abandonment.

### V. Security & Multitenant Isolation (NON-NEGOTIABLE)
Row-Level Security (RLS) policies in PostgreSQL are REQUIRED for multitenant data isolation. Audit logs MUST track all document changes with user_id, timestamp, and version. Input validation MUST occur before all AI API calls. Environment variables MUST be used for sensitive configurations. HTTPS MUST be enforced in production. Basic rate limiting per tenant MUST be implemented.

**Rationale**: Security breaches and data leaks would be catastrophic for a procurement platform handling sensitive organizational data.

## Code Quality Standards

TypeScript strict mode configuration MUST include: strict: true, noImplicitAny: true, strictNullChecks: true. ESLint rules MUST enforce consistent code style. Prettier MUST be configured for automatic formatting. Import statements MUST be organized with absolute paths using TypeScript path mapping. Error boundaries MUST wrap all major component trees. API error handling MUST provide meaningful user feedback.

Component organization MUST follow the established pattern: reusable UI components in /components/ui, business logic in custom hooks, API calls through TanStack Query. Prop interfaces MUST be explicitly typed. Component APIs MUST be consistent across similar components.

## User Experience Requirements

Forms MUST use single-column layout with clear labels above inputs. Loading states MUST use skeleton screens for smooth perceived performance. Empty states MUST include friendly illustrations and clear next steps. Navigation MUST include breadcrumbs: Organization → Project → Template → Document. AI interaction MUST feel conversational with real-time streaming responses. Progress indicators are REQUIRED for multi-step processes.

Color palette MUST remain muted for secondary information (gray-500, gray-600) with accent colors only for primary actions and AI features. Icons MUST come from lucide-react library exclusively. Modals MUST be centered with dimmed backgrounds and easy dismissal.

## Performance Standards

Code-splitting by route MUST be implemented using React lazy loading. Images MUST be lazy-loaded and optimized to WebP format where supported. Database connection pooling MUST be configured appropriately. Vector embeddings storage MUST use pgvector extension for efficient RAG operations. WebSocket connections for real-time features MUST be implemented efficiently when needed.

Performance monitoring MUST track Core Web Vitals: Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS). Bundle analysis MUST be performed regularly to identify optimization opportunities.

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests MUST verify compliance with these principles before merge approval. Architecture decisions that conflict with these principles MUST be documented with explicit justification and approval from the technical lead.

Amendments to this constitution require documentation of the change rationale, impact assessment on existing code, and a migration plan for any breaking changes. Version bumps follow semantic versioning: MAJOR for backward-incompatible principle changes, MINOR for new principles or expanded guidance, PATCH for clarifications and refinements.

**Version**: 1.0.0 | **Ratified**: 2025-11-03 | **Last Amended**: 2025-11-03
