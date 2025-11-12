# licitAI - Plataforma de Geração de Documentos Licitatórios

Plataforma SaaS multitenancy que auxilia instituições públicas brasileiras a gerar automaticamente documentos licitatórios (Estudos Técnicos Preliminares, editais de licitação, contratos) usando orquestração de agentes de IA.

## 🚀 Tecnologias

### Frontend
- **React 18+** com TypeScript (modo strict)
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **TanStack Query** (gerenciamento de estado do servidor)
- **React Router** (roteamento)
- **Radix UI** (componentes base)
- **Zod** (validação)
- **Lucide React** (ícones)
- **Vitest** + **React Testing Library** (testes)

### Backend
- **Node.js 20+ LTS** com **NestJS**
- **TypeScript** (modo strict)
- **Prisma ORM**
- **PostgreSQL 15+** com extensão **pgvector**
- **Passport.js** (autenticação JWT)
- **Class-validator** (validação DTO)
- **Jest** + **@nestjs/testing** (testes)

### IA & Agentes
- **Claude API** (Anthropic - modelo claude-sonnet-4)
- **OpenAI Embeddings** (text-embedding-3-small para busca semântica)
- **pgvector** para busca vetorial (RAG)

## 📋 Pré-requisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL 15+** com extensão **pgvector**
- **Docker** e **Docker Compose** (recomendado para desenvolvimento)
- **Chave de API do Anthropic** (Claude)
- **Chave de API da OpenAI** (para embeddings)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd licitAI
```

### 2. Configure o Banco de Dados

#### Opção A: Com Docker (Recomendado)

O Docker Compose já inclui PostgreSQL com pgvector configurado:

```bash
docker-compose up -d postgres
```

Isso irá:
- Iniciar PostgreSQL 15 na porta 5432
- Instalar a extensão pgvector automaticamente
- Criar o banco de dados `licitai_dev`

#### Opção B: PostgreSQL Local

Se você tiver PostgreSQL instalado localmente:

```bash
# Instale a extensão pgvector
# No Ubuntu/Debian:
sudo apt install postgresql-15-pgvector

# No macOS com Homebrew:
brew install pgvector

# Crie o banco de dados
createdb licitai_dev

# Habilite a extensão
psql licitai_dev -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 3. Configure as Variáveis de Ambiente

#### Backend

```bash
cd backend
cp .env.example .env
```

Edite `backend/.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/licitai_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# API Keys
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"
```

**⚠️ IMPORTANTE:** Nunca commite suas chaves de API! O arquivo `.env` está no `.gitignore`.

#### Frontend

```bash
cd frontend
cp .env.example .env
```

Edite `frontend/.env` se necessário:

```env
VITE_API_URL=http://localhost:3001
```

### 4. Instale as Dependências

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 5. Configure o Banco de Dados

Execute as migrações do Prisma para criar as tabelas:

```bash
cd backend

# Gera o Prisma Client
npm run prisma:generate

# Executa as migrações (cria tabelas, índices, RLS policies, etc.)
npm run prisma:migrate

# (Opcional) Popula o banco com dados de exemplo
npm run prisma:seed
```

**O que as migrações fazem:**
- Criam todas as tabelas (organizations, users, projects, documents, etc.)
- Habilitam a extensão pgvector
- Criam índices HNSW para busca vetorial eficiente
- Configuram Row-Level Security (RLS) para isolamento multitenancy
- Configuram políticas de segurança para cada tabela

## 🏃 Executando o Projeto

### Opção 1: Com Docker Compose (Recomendado)

Inicia todos os serviços (PostgreSQL, Backend, Frontend):

```bash
# Na raiz do projeto
docker-compose up
```

**Serviços disponíveis:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Prisma Studio: `cd backend && npm run prisma:studio`

### Opção 2: Desenvolvimento Local

Ideal para desenvolvimento ativo:

#### 1. Inicie o PostgreSQL (se não estiver rodando)

```bash
docker-compose up -d postgres
# ou use sua instalação local
```

#### 2. Inicie o Backend (Terminal 1)

```bash
cd backend
npm run dev
```

O backend estará disponível em http://localhost:3001

#### 3. Inicie o Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

O frontend estará disponível em http://localhost:5173

## 🧪 Testes

### Backend (24 testes - 100% passando ✅)

```bash
cd backend

# Executa todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de código
npm run test:cov

# Testes específicos
npm test -- projects.service.spec.ts
```

**Cobertura:**
- ProjectsService: 10 testes (CRUD, paginação, isolamento de tenant)
- ProjectsController: 8 testes (endpoints, validação)
- SearchService: 6 testes (busca semântica, sugestões)

### Frontend (38 testes - 100% passando ✅)

```bash
cd frontend

# Executa todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Interface de testes
npm run test:ui

# Cobertura de código
npm run test:coverage
```

**Cobertura:**
- SearchBar: 8 testes (interação do usuário, teclado)
- SearchResults: 13 testes (renderização, filtragem)
- useSearch: 11 testes (hooks, cache)
- useProjects: 6 testes (CRUD, paginação)

## 📚 Funcionalidades Implementadas

### ✅ User Story 1: Autenticação e Multi-tenancy
- Login/Logout com JWT
- Refresh tokens
- Isolamento de dados por organização (RLS)
- Gerenciamento de usuários

### ✅ User Story 2: Projetos e Chat com IA
- CRUD de projetos
- Interface de chat com Claude
- Streaming de respostas da IA
- Histórico de conversas

### ✅ User Story 3: Gerenciamento de Documentos
- Geração de documentos com IA
- Controle de versões
- Visualização em tempo real
- Exportação (PDF, DOCX)

### ✅ User Story 4: Templates Customizados
- Biblioteca de templates
- Templates do sistema e personalizados
- Editor de templates
- Variáveis dinâmicas

### ✅ User Story 5: Sistema de Anexos com IA
- Upload de arquivos (PDF, DOC, TXT, imagens)
- Extração de texto com OCR
- Análise automática pela IA
- Busca em anexos

### ✅ User Story 6: Colaboração em Equipe
- Sistema de permissões (RBAC)
- Roles: Admin, Manager, Editor, Viewer
- Controle de acesso granular
- Convites de usuários

### ✅ User Story 7: Visibilidade de Orquestração de Agentes
- Progress tracker visual
- 4 agentes (Researcher → Validator → Writer → Reviewer)
- Indicadores de fase em tempo real
- Mensagens de progresso

### ✅ User Story 8: Busca Semântica Inteligente
- Busca vetorial com pgvector
- Embeddings da OpenAI
- Autocomplete inteligente
- Busca em documentos e conversas
- Scores de similaridade

## 📦 Scripts Disponíveis

### Backend

```bash
npm run dev              # Desenvolvimento (hot-reload)
npm run build            # Build para produção
npm run start:prod       # Inicia em produção
npm run lint             # ESLint
npm run format           # Prettier
npm test                 # Testes unitários
npm run test:watch       # Testes em watch mode
npm run test:cov         # Cobertura de testes

# Prisma
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Executa migrações
npm run prisma:studio    # Interface visual do banco
npm run prisma:seed      # Popula dados de exemplo
```

### Frontend

```bash
npm run dev              # Desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build
npm run lint             # ESLint
npm run format           # Prettier
npm test                 # Testes unitários
npm run test:ui          # Interface de testes
npm run test:coverage    # Cobertura de testes
npm run test:e2e         # Testes E2E (Playwright)
```

## 🏗️ Estrutura do Projeto

```
licitAI/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Schema do banco
│   │   ├── migrations/             # Migrações SQL
│   │   └── seed.ts                 # Dados de exemplo
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/              # Autenticação JWT
│   │   │   ├── projects/          # Gestão de projetos
│   │   │   ├── documents/         # Documentos e versões
│   │   │   ├── chat/              # Chat com IA
│   │   │   ├── templates/         # Templates
│   │   │   ├── attachments/       # Sistema de anexos
│   │   │   ├── team/              # Colaboração (RBAC)
│   │   │   ├── ai-agents/         # Orquestração de agentes
│   │   │   └── search/            # Busca semântica
│   │   ├── prisma/                # Prisma Service
│   │   └── main.ts                # Entry point
│   └── test/                      # Testes unitários
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── features/          # Componentes de features
│   │   │   ├── forms/             # Formulários
│   │   │   ├── layouts/           # Layouts
│   │   │   └── ui/                # Componentes base
│   │   ├── contexts/              # React Contexts
│   │   ├── hooks/                 # Custom hooks
│   │   ├── pages/                 # Páginas/rotas
│   │   ├── services/              # API clients
│   │   └── test/                  # Testes e helpers
│   └── vitest.config.ts           # Config de testes
│
├── specs/                          # Documentação técnica
├── docker-compose.yml             # Configuração Docker
└── README.md                      # Este arquivo
```

## 🔒 Segurança

### Multi-tenancy e Isolamento de Dados
- **Row-Level Security (RLS)** do PostgreSQL
- Políticas de segurança por tabela
- Tenant ID validado em todas as queries
- Tokens JWT com tenant context

### Autenticação
- JWT com refresh tokens
- Tokens de curta duração (15 min)
- Refresh tokens de longa duração (7 dias)
- Rotação automática de tokens

### Validação
- DTOs com class-validator
- Sanitização de inputs
- Validação antes de enviar para IA
- Rate limiting configurado

### Auditoria
- Logs de todas as alterações de dados
- Registro de acesso
- Compliance com LGPD

## 🐛 Troubleshooting

### Erro: "relation 'documents' does not exist"
Execute as migrações:
```bash
cd backend
npm run prisma:migrate
```

### Erro: "extension 'vector' does not exist"
Instale pgvector no PostgreSQL (veja seção de configuração do banco)

### Erro: "ANTHROPIC_API_KEY is not defined"
Configure a variável no arquivo `backend/.env`

### Testes falhando no frontend
Certifique-se que jsdom está instalado:
```bash
cd frontend
npm install --save-dev jsdom
```

### Porta 3001 ou 5173 já em uso
Altere as portas no arquivo `.env` ou mate os processos:
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

## 📈 Status do Projeto

- ✅ **Phase 1: Setup & Infrastructure** - Completo
- ✅ **Phase 2: User Stories 1-3 (MVP Core)** - Completo
- ✅ **Phase 3: User Stories 4-8 (Features Avançadas)** - Completo
- ✅ **Testes Completos** - 62 testes (100% passando)

**Próximos passos sugeridos:**
- Deploy em produção (AWS/Azure/GCP)
- Monitoramento e observabilidade
- CI/CD pipeline
- Documentação da API (Swagger)
- Otimizações de performance

## 📝 Licença

Este projeto é privado e não possui licença pública.

## 👥 Equipe

licitAI Team

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe.

---

**Versão:** 1.0.0
**Última atualização:** Novembro 2024
