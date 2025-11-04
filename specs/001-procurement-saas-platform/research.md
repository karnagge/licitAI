# Research: Brazilian Procurement Document Generation Platform

**Feature**: `001-procurement-saas-platform`  
**Date**: November 3, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for all technology choices, best practices, and implementation patterns required for building the multitenant SaaS procurement platform. All technical unknowns from the planning phase have been resolved.

---

## 1. Multitenant Data Isolation with PostgreSQL RLS

### Decision
Implement Row-Level Security (RLS) policies in PostgreSQL to enforce tenant isolation at the database level, combined with application-level validation.

### Rationale
- **Database-level enforcement**: Even if application code has bugs, database prevents cross-tenant queries
- **Performance**: RLS policies are evaluated in database query planner, minimal overhead
- **Audit compliance**: Built-in PostgreSQL audit logging integrates naturally with RLS
- **Prisma compatibility**: Prisma ORM supports PostgreSQL RLS with proper session variable configuration

### Implementation Pattern
```sql
-- Enable RLS on all tenant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access based on tenant_id
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Set tenant context at connection level
SET app.current_tenant_id = '<user-tenant-id>';
```

### Alternatives Considered
- **Application-level only**: Rejected due to risk of query bugs exposing data
- **Separate database per tenant**: Rejected due to operational complexity and cost
- **Schema-per-tenant**: Rejected due to migration complexity and connection pooling issues

### Best Practices
- Set tenant context in NestJS middleware for every authenticated request
- Use Prisma middleware to automatically inject tenant_id in all queries
- Test tenant isolation explicitly in integration tests
- Add database-level foreign key constraints to enforce tenant_id consistency

### References
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/15/ddl-rowsecurity.html)
- [Prisma Multi-tenancy Guide](https://www.prisma.io/docs/guides/database/multi-tenancy)

---

## 2. AI Agent Orchestration with Claude Agent SDK

### Decision
Use Anthropic's Claude Agent SDK for orchestrating specialized AI agents (Researcher, Validator, Writer, Reviewer) with sequential execution pattern.

### Rationale
- **Native support**: Claude SDK designed specifically for multi-agent workflows
- **Streaming**: Built-in streaming capabilities for real-time user feedback
- **Context management**: Automatic handling of conversation history and context windows
- **Tool use**: Agent SDK supports tool calling for structured tasks (legal search, validation)
- **Cost-effective**: claude-sonnet-4 model balances quality and cost for document generation

### Implementation Pattern
```typescript
// Agent orchestration flow
async generateDocument(chat: Chat, template: Template) {
  // 1. Researcher Agent - Find relevant laws and regulations
  const researchContext = await researcherAgent.search({
    query: chat.messages.map(m => m.content),
    domain: 'Brazilian Procurement Law Lei 14.133/2021'
  });

  // 2. Validator Agent - Check requirements compliance
  const validationRules = await validatorAgent.validate({
    context: researchContext,
    requirements: template.sections.map(s => s.requirements)
  });

  // 3. Writer Agent - Generate document content
  const documentContent = await writerAgent.generate({
    template: template,
    research: researchContext,
    validation: validationRules,
    userInput: chat.messages
  });

  // 4. Reviewer Agent - Quality check and consistency
  const finalDocument = await reviewerAgent.review({
    content: documentContent,
    validation: validationRules,
    template: template
  });

  return finalDocument;
}
```

### Alternatives Considered
- **LangChain**: Rejected due to over-complexity for MVP sequential workflow
- **Direct OpenAI API**: Rejected because Claude performs better on long-form structured writing
- **Custom agent framework**: Rejected to avoid reinventing well-tested orchestration logic

### Best Practices
- Use streaming for Writer Agent to show real-time progress
- Implement retry logic with exponential backoff for API failures
- Track token usage per organization for cost monitoring
- Cache research results within same project context to reduce API calls
- Use structured output format (JSON mode) for Validator Agent

### References
- [Claude Agent SDK Documentation](https://docs.anthropic.com/claude/docs/agent-sdk)
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)

---

## 3. RAG Implementation with pgvector

### Decision
Use PostgreSQL's pgvector extension to store document embeddings and implement Retrieval-Augmented Generation (RAG) for context-aware document generation.

### Rationale
- **No external dependencies**: Avoids separate vector database (Pinecone, Weaviate) reducing infrastructure complexity
- **Transactional consistency**: Embeddings and documents in same database, atomic updates
- **Cost-effective**: No additional database hosting costs
- **Performance**: Handles millions of vectors before becoming bottleneck
- **Prisma compatibility**: pgvector types supported in Prisma schema

### Implementation Pattern
```typescript
// Prisma schema for vector embeddings
model Document {
  id        String   @id @default(uuid())
  content   String
  embedding Unsupported("vector(1536)")?  // Claude embeddings dimension
  tenantId  String
  projectId String
  
  @@index([tenantId, projectId])
}

// Generate embeddings when document created
async createDocument(content: string) {
  const embedding = await claudeAPI.createEmbedding(content);
  
  await prisma.document.create({
    data: {
      content,
      embedding: `[${embedding.join(',')}]`,  // pgvector format
      tenantId,
      projectId
    }
  });
}

// Similarity search for RAG
async findRelevantDocuments(query: string, limit: number = 5) {
  const queryEmbedding = await claudeAPI.createEmbedding(query);
  
  return prisma.$queryRaw`
    SELECT id, content, 
           1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM documents
    WHERE tenant_id = ${tenantId} AND project_id = ${projectId}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `;
}
```

### Alternatives Considered
- **Pinecone**: Rejected due to additional cost and external dependency
- **Weaviate**: Rejected due to operational complexity for MVP
- **In-memory vectors**: Rejected due to loss of data on restart
- **Elasticsearch**: Rejected as overkill for semantic search only

### Best Practices
- Create HNSW index on vector columns for fast similarity search: `CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);`
- Store embeddings asynchronously after document creation to avoid blocking
- Batch embed multiple documents when processing attachments
- Set appropriate similarity threshold (e.g., 0.7) to filter low-relevance results
- Include metadata in embedding (document type, section) for better retrieval

### References
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [pgvector Performance Guide](https://github.com/pgvector/pgvector#performance)

---

## 4. Real-time AI Streaming with Server-Sent Events (SSE)

### Decision
Use Server-Sent Events (SSE) for streaming AI-generated content to frontend in real-time, rather than WebSockets or polling.

### Rationale
- **Simpler than WebSockets**: Unidirectional communication sufficient for AI streaming
- **Built-in reconnection**: Browsers automatically reconnect SSE connections
- **HTTP-friendly**: Works with existing load balancers and proxies without special configuration
- **Lower overhead**: No WebSocket handshake complexity
- **Perfect for streaming**: Designed exactly for server-to-client streaming use case

### Implementation Pattern
```typescript
// Backend NestJS controller
@Get('generate/stream')
@Sse()
async streamGeneration(@Query('chatId') chatId: string): Observable<MessageEvent> {
  return new Observable((subscriber) => {
    const stream = this.aiService.generateDocument(chatId);
    
    stream.on('data', (chunk) => {
      subscriber.next({ data: { type: 'content', content: chunk } });
    });
    
    stream.on('status', (status) => {
      subscriber.next({ data: { type: 'status', agent: status.agent } });
    });
    
    stream.on('end', () => {
      subscriber.next({ data: { type: 'complete' } });
      subscriber.complete();
    });
  });
}

// Frontend React component
useEffect(() => {
  const eventSource = new EventSource(`/api/generate/stream?chatId=${chatId}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'content') {
      setGeneratedText(prev => prev + data.content);
    } else if (data.type === 'status') {
      setCurrentAgent(data.agent);
    } else if (data.type === 'complete') {
      eventSource.close();
    }
  };
  
  return () => eventSource.close();
}, [chatId]);
```

### Alternatives Considered
- **WebSockets**: Rejected as bidirectional communication not needed for AI streaming
- **Long polling**: Rejected due to inefficiency and connection overhead
- **GraphQL subscriptions**: Rejected to avoid adding GraphQL complexity to REST API

### Best Practices
- Set `Content-Type: text/event-stream` header
- Send periodic keepalive comments to prevent connection timeout
- Implement retry logic on client side with exponential backoff
- Close EventSource when component unmounts to prevent memory leaks
- Use structured message format with `type` field for different message kinds

### References
- [MDN SSE Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [NestJS SSE Guide](https://docs.nestjs.com/techniques/server-sent-events)

---

## 5. Document Versioning Strategy

### Decision
Implement immutable version snapshots with full content duplication, optimized with deduplication at storage level if needed.

### Rationale
- **Simplicity**: Each version is complete and independent, easy to restore
- **Audit compliance**: Complete history for legal requirements
- **Fast retrieval**: No need to reconstruct version by applying diffs
- **Reliable rollback**: Simply copy old version content to new version
- **Clear history**: Users see exactly what document looked like at any point

### Implementation Pattern
```typescript
// Prisma schema
model DocumentVersion {
  id          String   @id @default(uuid())
  documentId  String
  content     String   // Full content snapshot
  version     Int      // Sequential version number
  createdBy   String   // User who created this version
  createdAt   DateTime @default(now())
  changeType  String   // 'manual_edit' | 'ai_generated' | 'rollback'
  description String?  // Optional change description
  
  document Document @relation(fields: [documentId], references: [id])
  user     User     @relation(fields: [createdBy], references: [id])
  
  @@unique([documentId, version])
  @@index([documentId, createdAt])
}

// Create version on every change
async updateDocument(documentId: string, newContent: string, userId: string) {
  const currentVersion = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: { version: 'desc' }
  });
  
  await prisma.documentVersion.create({
    data: {
      documentId,
      content: newContent,
      version: (currentVersion?.version || 0) + 1,
      createdBy: userId,
      changeType: 'manual_edit'
    }
  });
}

// Rollback to previous version
async rollbackVersion(documentId: string, targetVersion: number, userId: string) {
  const targetSnapshot = await prisma.documentVersion.findUnique({
    where: { documentId_version: { documentId, version: targetVersion } }
  });
  
  await this.updateDocument(documentId, targetSnapshot.content, userId);
}
```

### Alternatives Considered
- **Delta-based versioning**: Rejected due to complexity in reconstructing versions
- **Git-like diffs**: Rejected to avoid implementing complex diff/patch logic
- **External version control**: Rejected to keep all data in single database

### Best Practices
- Create version automatically on every document update (auto-save triggers this)
- Distinguish AI-generated vs manual changes in `changeType` field
- Implement pagination for version history (show most recent 20, load more on demand)
- Add soft delete instead of hard delete to preserve audit trail
- Consider compression for very old versions if storage becomes issue

### References
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Immutable Data Structures](https://en.wikipedia.org/wiki/Persistent_data_structure)

---

## 6. File Upload Handling with Local Storage

### Decision
Store uploaded files on local filesystem organized by tenant/project hierarchy, with metadata in PostgreSQL for MVP.

### Rationale
- **Simplicity**: No external object storage service (S3) needed for MVP
- **Cost-effective**: No additional storage service costs
- **Fast local access**: Reading files from disk faster than remote API calls
- **Easy backup**: Filesystem backups using standard tools
- **Sufficient for MVP scale**: 10MB limit and expected volume manageable locally

### Implementation Pattern
```typescript
// File storage service
@Injectable()
export class FileStorageService {
  private uploadDir = process.env.UPLOAD_DIR || './uploads';
  
  async saveFile(file: Express.Multer.File, tenantId: string, projectId: string) {
    const fileId = uuidv4();
    const extension = path.extname(file.originalname);
    const filePath = path.join(
      this.uploadDir,
      tenantId,
      projectId,
      `${fileId}${extension}`
    );
    
    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    
    // Save file
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Save metadata to database
    return prisma.attachment.create({
      data: {
        id: fileId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        tenantId,
        projectId
      }
    });
  }
  
  async getFile(fileId: string, tenantId: string) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: fileId, tenantId }  // Ensure tenant isolation
    });
    
    return fs.promises.readFile(attachment.path);
  }
}

// Multer configuration
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### Alternatives Considered
- **AWS S3**: Rejected for MVP to avoid external dependencies and costs
- **Database BLOB storage**: Rejected due to poor performance for binary data
- **MinIO (self-hosted S3)**: Rejected as unnecessary complexity for MVP

### Best Practices
- Validate file types using MIME type and file extension
- Scan uploaded files with antivirus in production (integrate ClamAV)
- Set appropriate filesystem permissions (read/write for app only)
- Implement file cleanup job for orphaned files (deleted attachments)
- Add file size limits at both application and Nginx/web server level
- Consider migration to S3-compatible storage post-MVP for scalability

### Migration Path to S3
When scaling beyond single server:
1. Implement storage interface with local and S3 implementations
2. Upload new files to S3
3. Lazy-migrate existing files on access
4. Update file paths in database to S3 URLs

### References
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Multer Documentation](https://github.com/expressjs/multer)

---

## 7. Authentication Strategy with JWT and Refresh Tokens

### Decision
Implement JWT-based authentication with short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days), stored in httpOnly cookies.

### Rationale
- **Stateless authentication**: No session storage needed, enables horizontal scaling
- **Security**: httpOnly cookies prevent XSS attacks stealing tokens
- **User experience**: Refresh tokens enable "remember me" without frequent re-login
- **Standard practice**: Industry-standard approach with well-tested libraries
- **Revocability**: Refresh tokens can be revoked in database for security

### Implementation Pattern
```typescript
// Auth service
@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    
    const accessToken = this.jwtService.sign(
      { userId: user.id, tenantId: user.tenantId },
      { expiresIn: '15m' }
    );
    
    const refreshToken = uuidv4();
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    return { accessToken, refreshToken };
  }
  
  async refresh(refreshToken: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });
    
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    const newAccessToken = this.jwtService.sign(
      { userId: tokenRecord.user.id, tenantId: tokenRecord.user.tenantId },
      { expiresIn: '15m' }
    );
    
    return { accessToken: newAccessToken };
  }
}

// Frontend interceptor for automatic token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      const { accessToken } = await api.post('/auth/refresh');
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Alternatives Considered
- **Session-based auth**: Rejected due to poor horizontal scalability
- **Long-lived JWT only**: Rejected due to security risk (can't revoke)
- **OAuth2 password grant**: Rejected as over-complex for MVP

### Best Practices
- Store access token in memory (React state) not localStorage (XSS risk)
- Store refresh token in httpOnly cookie (more secure than localStorage)
- Implement token rotation: issue new refresh token on each refresh
- Add refresh token blacklist for logout (mark as revoked in database)
- Set CSRF token for refresh endpoint
- Use bcrypt with cost factor 12 for password hashing

### References
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)

---

## 8. Frontend State Management with TanStack Query

### Decision
Use TanStack Query (React Query) for server state management, eliminating need for Redux or similar complex state management.

### Rationale
- **Built for server state**: Designed specifically for fetching, caching, synchronizing server data
- **Automatic caching**: Reduces API calls with intelligent cache invalidation
- **Optimistic updates**: UI feels instant while backend processes
- **Error handling**: Built-in retry logic and error states
- **Reduced boilerplate**: Much less code than Redux for API calls

### Implementation Pattern
```typescript
// API hooks using TanStack Query
export const useProjects = (organizationId: string) => {
  return useQuery({
    queryKey: ['projects', organizationId],
    queryFn: () => api.get(`/organizations/${organizationId}/projects`),
    staleTime: 5 * 60 * 1000,  // Consider fresh for 5 minutes
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (project: CreateProjectDto) => api.post('/projects', project),
    onSuccess: (data, variables) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ['projects', variables.organizationId] });
      
      // Optimistically add to cache
      queryClient.setQueryData(
        ['projects', variables.organizationId],
        (old: Project[]) => [...old, data]
      );
    }
  });
};

// Component usage
function ProjectList() {
  const { data: projects, isLoading, error } = useProjects(organizationId);
  const createProject = useCreateProject();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {projects.map(project => <ProjectCard key={project.id} project={project} />)}
      <Button onClick={() => createProject.mutate(newProject)}>
        Create Project
      </Button>
    </div>
  );
}
```

### Alternatives Considered
- **Redux Toolkit**: Rejected as overkill for primarily server-driven state
- **Zustand**: Rejected as unnecessary with TanStack Query handling server state
- **Context API only**: Rejected due to lack of caching and loading states

### Best Practices
- Use query keys consistently: `['entity', id, filters]` pattern
- Set appropriate `staleTime` based on data volatility (5 min for projects, 30 sec for chat messages)
- Implement optimistic updates for instant UI feedback
- Use `enabled` option to conditionally fetch (e.g., only when user authenticated)
- Prefetch data on hover for instant navigation
- Use `keepPreviousData` for paginated lists to avoid loading flicker

### References
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

---

## 9. Form Validation with Zod and React Hook Form

### Decision
Use Zod for runtime type validation combined with React Hook Form for performant form handling and validation.

### Rationale
- **Type safety**: Zod schemas generate TypeScript types automatically
- **Runtime validation**: Catches invalid data at runtime (user input, API responses)
- **DRY principle**: Single schema for both frontend and backend validation
- **Developer experience**: Excellent error messages and TypeScript integration
- **Performance**: React Hook Form minimizes re-renders

### Implementation Pattern
```typescript
// Shared Zod schema (in /shared/types)
export const CreateProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  organizationId: z.string().uuid()
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

// Backend NestJS DTO validation
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}
  
  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException(error.errors);
    }
  }
}

@Post()
async createProject(
  @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto
) {
  return this.projectsService.create(dto);
}

// Frontend React Hook Form with Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function CreateProjectForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectDto>({
    resolver: zodResolver(CreateProjectSchema)
  });
  
  const onSubmit = (data: CreateProjectDto) => {
    createProject.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('name')}
        error={errors.name?.message}
      />
      <Button type="submit">Create</Button>
    </form>
  );
}
```

### Alternatives Considered
- **Yup**: Rejected as Zod has better TypeScript support
- **Class-validator only**: Rejected as doesn't work in frontend
- **Manual validation**: Rejected due to code duplication and error-prone

### Best Practices
- Define all schemas in `/shared/types` for reuse
- Use `.strict()` on schemas to reject unknown properties
- Provide clear, user-friendly error messages in Portuguese
- Validate on blur for better UX (not on every keystroke)
- Transform data in schema (e.g., `.transform(s => s.trim())` for strings)
- Use `.refine()` for complex validation logic (e.g., date ranges)

### References
- [Zod Documentation](https://zod.dev/)
- [React Hook Form Documentation](https://react-hook-form.com/)

---

## 10. Testing Strategy for Multitenant SaaS

### Decision
Implement three-tier testing: unit tests for business logic, integration tests for API endpoints with real database, E2E tests for critical user journeys.

### Rationale
- **Confidence**: Each tier catches different classes of bugs
- **Tenant isolation critical**: Integration tests must verify RLS policies work
- **Speed**: Unit tests fast, integration tests moderate, E2E tests slow - run in CI pipeline
- **Real scenarios**: Integration tests use real PostgreSQL to catch schema issues
- **User perspective**: E2E tests validate complete flows work end-to-end

### Implementation Pattern
```typescript
// Unit test example - business logic
describe('DocumentVersionService', () => {
  let service: DocumentVersionService;
  let prisma: MockPrismaService;
  
  beforeEach(() => {
    prisma = createMockPrisma();
    service = new DocumentVersionService(prisma);
  });
  
  it('should create new version with incremented version number', async () => {
    prisma.documentVersion.findFirst.mockResolvedValue({ version: 5 });
    
    await service.createVersion('doc-123', 'new content', 'user-456');
    
    expect(prisma.documentVersion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ version: 6 })
    });
  });
});

// Integration test example - tenant isolation
describe('Projects API (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    
    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });
  
  it('should not return projects from other tenants', async () => {
    // Create projects for two different tenants
    await prisma.project.createMany({
      data: [
        { id: 'proj-1', name: 'Tenant A Project', tenantId: 'tenant-a' },
        { id: 'proj-2', name: 'Tenant B Project', tenantId: 'tenant-b' }
      ]
    });
    
    // Login as tenant A user
    const { accessToken } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user-a@tenant-a.com', password: 'password' });
    
    // Request projects
    const response = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    
    // Should only see tenant A projects
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('proj-1');
    expect(response.body.some(p => p.id === 'proj-2')).toBe(false);
  });
});

// E2E test example - complete user journey
describe('Document Generation Flow (E2E)', () => {
  test('User Story 1: Organization Setup to Document Generation', async ({ page }) => {
    // 1. Create organization account
    await page.goto('/register');
    await page.fill('[name="email"]', 'admin@institution.gov.br');
    await page.fill('[name="password"]', 'SecurePass123');
    await page.fill('[name="organizationName"]', 'City Hall');
    await page.click('button:has-text("Create Account")');
    
    // 2. Verify organization workspace
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('City Hall');
    
    // 3. Create project
    await page.click('button:has-text("New Project")');
    await page.fill('[name="name"]', 'School Desks Procurement');
    await page.click('button:has-text("Create")');
    
    // 4. Select template
    await expect(page).toHaveURL(/\/projects\/[^/]+/);
    await page.click('button:has-text("Select Template")');
    await page.click('text=ETP - Technical Preliminary Study');
    
    // 5. Chat with AI
    await page.fill('[placeholder="Describe your procurement needs"]', 
                    'Need 500 school desks, delivery in 90 days, R$250k budget');
    await page.click('button:has-text("Send")');
    
    // 6. Verify AI is working
    await expect(page.locator('[data-testid="agent-status"]'))
      .toContainText('Researcher Agent');
    
    // 7. Wait for document generation
    await expect(page.locator('[data-testid="document-content"]'))
      .toBeVisible({ timeout: 30000 });
    
    // 8. Verify document has content
    const documentText = await page.locator('[data-testid="document-content"]').textContent();
    expect(documentText).toContain('Lei 14.133/2021');
    expect(documentText.length).toBeGreaterThan(500);
  });
});
```

### Alternatives Considered
- **E2E only**: Rejected as too slow and doesn't catch unit-level bugs
- **Unit only**: Rejected as doesn't catch integration and RLS issues
- **Manual testing**: Rejected as not repeatable and time-consuming

### Best Practices
- Run unit tests on every commit (pre-commit hook)
- Run integration tests in CI pipeline before merge
- Run E2E tests nightly or before releases (slow)
- Use separate test database, reset between tests
- Mock Claude API calls in all tests (avoid real API costs)
- Test tenant isolation explicitly in every multi-tenant endpoint
- Use data factories (faker.js) for generating test data
- Measure code coverage, aim for 80%+ on business logic

### Test Data Strategy
```typescript
// Test data factory
export class TestDataFactory {
  static async createTenant(prisma: PrismaClient) {
    const tenant = await prisma.organization.create({
      data: {
        id: uuidv4(),
        name: faker.company.name(),
        type: 'municipal'
      }
    });
    
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await bcrypt.hash('password', 10),
        tenantId: tenant.id
      }
    });
    
    return { tenant, user };
  }
}
```

### References
- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Trophy Philosophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

## Summary of Key Decisions

| Area | Decision | Primary Rationale |
|------|----------|------------------|
| **Tenant Isolation** | PostgreSQL RLS + Application Guards | Database-level enforcement prevents bugs from causing data leaks |
| **AI Orchestration** | Claude Agent SDK with Sequential Flow | Native multi-agent support, streaming, cost-effective |
| **Vector Search** | pgvector in PostgreSQL | No external dependencies, transactional consistency, cost-effective |
| **AI Streaming** | Server-Sent Events (SSE) | Simpler than WebSockets, perfect for unidirectional streaming |
| **Versioning** | Immutable Full Snapshots | Audit compliance, simple rollback, fast retrieval |
| **File Storage** | Local Filesystem with S3 Migration Path | MVP simplicity, easy migration to S3 when scaling |
| **Authentication** | JWT + Refresh Tokens in httpOnly Cookies | Stateless, secure, standard practice |
| **Frontend State** | TanStack Query | Built for server state, automatic caching, optimistic updates |
| **Form Validation** | Zod + React Hook Form | Type safety, runtime validation, DRY schemas |
| **Testing** | Unit + Integration + E2E | Comprehensive coverage, explicit tenant isolation tests |

All technical unknowns have been resolved. Phase 1 (Design & Contracts) can now proceed with confidence.
