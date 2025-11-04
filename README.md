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

### Backend
- **Node.js 20+ LTS** com **NestJS**
- **TypeScript** (modo strict)
- **Prisma ORM**
- **PostgreSQL 15+** com extensão **pgvector**
- **Passport.js** (autenticação JWT)
- **Class-validator** (validação DTO)

### IA & Agentes
- **Claude Agent SDK** (Anthropic)
- **Claude API** (modelo claude-sonnet-4-20250514)
- **pgvector** para embeddings (funcionalidade RAG)

## 📋 Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker e Docker Compose (para desenvolvimento local)
- Chave de API do Claude (Anthropic)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd licitAI
```

### 2. Configure as variáveis de ambiente

#### Backend
```bash
cp backend/.env.example backend/.env
# Edite backend/.env e adicione suas chaves de API e configurações
```

#### Frontend
```bash
cp frontend/.env.example frontend/.env
# Edite frontend/.env se necessário
```

### 3. Instale as dependências

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

## 🏃 Executando o projeto

### Opção 1: Com Docker Compose (Recomendado)

```bash
docker-compose up
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

### Opção 2: Desenvolvimento Local

#### 1. Inicie o PostgreSQL
```bash
docker-compose up postgres
```

#### 2. Execute as migrações do banco de dados
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed  # (opcional) seed com dados iniciais
```

#### 3. Inicie o backend
```bash
cd backend
npm run dev
```

#### 4. Inicie o frontend (em outro terminal)
```bash
cd frontend
npm run dev
```

## 📚 Documentação

- **Especificação**: `specs/001-procurement-saas-platform/spec.md`
- **Plano Técnico**: `specs/001-procurement-saas-platform/plan.md`
- **Modelo de Dados**: `specs/001-procurement-saas-platform/data-model.md`
- **Tarefas**: `specs/001-procurement-saas-platform/tasks.md`
- **API Contracts**: `specs/001-procurement-saas-platform/contracts/api-spec.yaml`

## 🧪 Testes

### Backend
```bash
cd backend
npm run test           # Testes unitários
npm run test:e2e       # Testes de integração
npm run test:cov       # Cobertura de testes
```

### Frontend
```bash
cd frontend
npm run test           # Testes unitários
npm run test:e2e       # Testes E2E (Playwright)
npm run test:coverage  # Cobertura de testes
```

## 📦 Scripts Disponíveis

### Backend
- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Build para produção
- `npm run start:prod` - Inicia servidor de produção
- `npm run lint` - Executa linter
- `npm run format` - Formata código
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:studio` - Abre Prisma Studio

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa linter
- `npm run format` - Formata código

## 🏗️ Estrutura do Projeto

```
licitAI/
├── frontend/          # Aplicação React + Vite
├── backend/           # Aplicação NestJS
├── shared/            # Tipos TypeScript compartilhados
├── specs/             # Especificações e documentação
└── docker-compose.yml # Configuração Docker
```

## 🔒 Segurança

- Isolamento multitenancy com Row-Level Security (RLS) do PostgreSQL
- Autenticação JWT com refresh tokens
- Validação de entrada antes de chamadas de API de IA
- Logs de auditoria para todas as alterações de dados
- Conformidade com LGPD (Lei Geral de Proteção de Dados)

## 📈 Status do Projeto

- ✅ **Phase 1: Setup** - Completo
- 🔄 **Phase 2: Foundational Infrastructure** - Em andamento
- ⏳ **Phase 3: User Story 1 (MVP)** - Pendente
- ⏳ **Phases 4-11** - Pendente

## 📝 Licença

Este projeto é privado e não possui licença pública.

## 👥 Equipe

licitAI Team

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe.
