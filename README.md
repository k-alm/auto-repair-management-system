# Auto Repair Management System

Back-end (MVP) do Sistema Integrado de Atendimento e Execução de Serviços de uma oficina mecânica de médio porte.
Projeto do **Tech Challenge – Fase 1** | Curso **SOAT — Software Architecture**.

---

## Sumário

1. [Objetivo do projeto](#1-objetivo-do-projeto)
2. [Descrição resumida da solução](#2-descrição-resumida-da-solução)
3. [Arquitetura utilizada](#3-arquitetura-utilizada)
4. [Tecnologias utilizadas](#4-tecnologias-utilizadas)
5. [Pré-requisitos](#5-pré-requisitos)
6. [Instruções para execução](#6-instruções-para-execução)
7. [Instruções para execução dos testes](#7-instruções-para-execução-dos-testes)
8. [Acesso ao Swagger / documentação da API](#8-acesso-ao-swagger--documentação-da-api)
9. [Decisão e justificativa do banco de dados](#9-decisão-e-justificativa-do-banco-de-dados)
10. [Usuários, credenciais de demonstração e autenticação](#10-usuários-credenciais-de-demonstração-e-autenticação)
11. [Estrutura dos principais diretórios](#11-estrutura-dos-principais-diretórios)
12. [Documentação DDD](#12-documentação-ddd)
13. [Análise de vulnerabilidades](#13-análise-de-vulnerabilidades)
14. [Vídeo da entrega](#14-vídeo-da-entrega)

---

## 1. Objetivo do projeto

A oficina realiza hoje o atendimento, o diagnóstico, a execução e a entrega dos veículos com anotações manuais e planilhas, o que gera:

- erros na priorização dos atendimentos;
- falhas no controle de peças e insumos;
- dificuldade em acompanhar o status dos serviços;
- perda de histórico de clientes e veículos;
- ineficiência no fluxo de orçamentos e autorizações.

O objetivo deste projeto é entregar a **primeira versão (MVP) do back-end** do sistema, com foco em **gestão de ordens de serviço, clientes e peças**, aplicando **Domain-Driven Design (DDD)** e boas práticas de **qualidade de software e segurança**. O cliente pode acompanhar o andamento do serviço e aprovar ou rejeitar o orçamento por meio de links individuais enviados por e-mail.

## 2. Descrição resumida da solução

API RESTful monolítica que cobre os fluxos abaixo.

**Criação da Ordem de Serviço (OS)**
1. O atendente identifica o cliente pelo **CPF/CNPJ** e informa o veículo (placa, marca, modelo, ano), os serviços solicitados e as peças/insumos necessários.
2. A OS nasce com status `RECEBIDA` e o **orçamento é gerado automaticamente** (soma dos serviços + (peças × quantidade)), na mesma transação.
3. O cliente recebe por e-mail um **link pessoal de acompanhamento**.
4. Após o diagnóstico, o orçamento é **enviado ao cliente** (e-mail com link individual, de uso único e com prazo de validade).
5. O cliente **aprova ou rejeita** o orçamento. Aprovado: a OS vai para `EM_EXECUCAO` e o estoque das peças é baixado. Rejeitado ou expirado: a OS é `CANCELADA`.

**Acompanhamento da OS**

```
RECEBIDA → EM_DIAGNOSTICO → AGUARDANDO_APROVACAO → EM_EXECUCAO → FINALIZADA → ENTREGUE
                 └────────────────┴───────────────────┴──────────→ CANCELADA
```

- As transições seguem regras de negócio no domínio. Transições inválidas retornam `409 Conflict`.
- A passagem `AGUARDANDO_APROVACAO → EM_EXECUCAO` só ocorre pela aprovação do orçamento.
- O cliente consulta o andamento via API pública, usando o token do link recebido.

**Gestão administrativa**
- CRUD de clientes, veículos, serviços, peças/insumos e funcionários.
- Controle de estoque (cadastro com saldo, ajuste de saldo, entrada de estoque, validação de disponibilidade e baixa na aprovação).
- Listagem e detalhamento de ordens de serviço.
- Relatório de **tempo médio de execução** (de `EM_EXECUCAO` até `FINALIZADA`).

**Segurança e qualidade**
- Autenticação **JWT** nas APIs administrativas; senhas com **bcrypt**.
- Validação de **CPF/CNPJ** (dígitos verificadores) e de **placa** (padrão antigo `ABC1234` e Mercosul `ABC1D23`).
- Tokens públicos opacos armazenados apenas como hash (SHA-256), com expiração e *rate limit*.
- Testes unitários e de integração, com limite mínimo de cobertura de 80% configurado.

## 3. Arquitetura utilizada

**Back-end monolítico em arquitetura em camadas**, organizado por módulos de domínio (um por contexto/subdomínio). Cada módulo segue a mesma divisão:

```
src/modules/<modulo>/
├── domain/           # Entidades, objetos de valor, regras de negócio, erros e interfaces de repositório
├── application/      # Casos de uso (um por pasta: usecase, input, response)
├── infrastructure/   # Implementações (Prisma/PostgreSQL, segurança, tokens)
└── interface/http/   # Rotas Fastify, schemas Zod (validação + OpenAPI) e presenters
```

Regra de dependência: `interface → application → domain`; `infrastructure` implementa as interfaces definidas no `domain`.

**Módulos / Bounded Contexts**

| Contexto | Módulos no código |
|---|---|
| Gestão de Clientes e Veículos | `customers`, `vehicles` |
| Ordens de Serviço | `work-orders`, `quotes`, `public-tracking`, `reports` |
| Catálogo de Serviços e Peças | `services`, `parts` |
| Identidade e Acesso | `authentication`, `employees` |
| Notificações (suporte) | `src/shared/infrastructure` (outbox de e-mails + worker) |

## 4. Tecnologias utilizadas

| Categoria | Tecnologia |
|---|---|
| Linguagem | TypeScript (Node.js 24, ESM) |
| Framework HTTP | Fastify 5 |
| Validação e contratos | Zod + `fastify-type-provider-zod` |
| Documentação da API | `@fastify/swagger` (OpenAPI) + Scalar API Reference |
| Banco de dados | PostgreSQL 17 |
| ORM / migrations | Prisma 7 (`@prisma/adapter-pg`) |
| Autenticação | `@fastify/jwt`, `bcrypt` |
| Segurança HTTP | `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit` |
| E-mail | Nodemailer (Mailpit no ambiente local) |
| Testes | Vitest, `@vitest/coverage-v8`, Testcontainers (PostgreSQL) |
| Qualidade | Biome (lint/format), `tsc --noEmit` |
| Gerenciador de pacotes | pnpm 10 |
| Containerização | Docker, Docker Compose |

## 5. Pré-requisitos

**Para executar com Docker (recomendado)**
- Docker e Docker Compose

**Para executar localmente sem Docker para a API**
- Node.js 24
- pnpm 10 (`corepack enable`)
- Uma instância PostgreSQL (ou apenas o serviço `postgres` do Compose)

**Para os testes de integração**
- Docker em execução (os testes sobem um PostgreSQL via Testcontainers)

## 6. Instruções para execução

### 6.1 Com Docker Compose (ambiente completo)

```bash
git clone https://github.com/k-alm/auto-repair-management-system.git
cd auto-repair-management-system

cp .env.example .env
# edite o .env (veja a tabela de variáveis abaixo)

docker compose up --build
```

O Compose sobe: `postgres` → `migrate` (aplica as migrations e o *seed* do administrador) → `mailpit` → `api`.

| Serviço | URL |
|---|---|
| API | http://localhost:3333 |
| Documentação da API (Scalar) | http://localhost:3333/docs |
| Mailpit (caixa de e-mail de testes) | http://localhost:8025 |
| PostgreSQL (somente localhost) | `127.0.0.1:5433` |

Para parar: `docker compose down` (use `-v` para apagar o volume do banco).

### 6.2 Variáveis de ambiente (`.env`)

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development`, `test` ou `production` |
| `PORT` | Porta da API (padrão `3333`) |
| `JWT_SECRET` | Segredo do JWT — **mínimo 32 caracteres** |
| `JWT_EXPIRES_IN` | Validade do token de acesso (padrão `1h`) |
| `ALLOWED_ORIGINS` | Origens permitidas no CORS (separadas por `,`) |
| `APPROVAL_TOKEN_TTL_HOURS` | Validade do link de aprovação do orçamento (padrão `72`) |
| `TRACKING_TOKEN_TTL_DAYS` | Validade do link de acompanhamento (padrão `90`) |
| `PUBLIC_API_URL` | URL pública usada nos links dos e-mails |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Servidor de e-mail (no Compose, `SMTP_HOST=mailpit`) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Banco usado pelo Compose. **Obrigatórias para rodar via Docker Compose** |
| `POSTGRES_PORT` | Porta usada pelo banco do Compose (padrão `5433`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Administrador criado pelo *seed* (senha com **mínimo 12 caracteres**) |
| `DATABASE_URL` | Apenas para rodar a API fora do Docker |

### 6.3 Execução local (API fora do Docker)

```bash
pnpm install
cp .env.example .env            # preencha, incluindo DATABASE_URL
docker compose up -d postgres mailpit   # opcional: apenas banco e e-mail

pnpm db:generate
pnpm db:deploy                  # aplica as migrations
pnpm db:seed                    # cria o administrador inicial
pnpm dev                        # API em modo watch
```

Scripts úteis: `pnpm build`, `pnpm start`, `pnpm typecheck`, `pnpm check:fix`.

## 7. Instruções para execução dos testes

```bash
pnpm install
pnpm db:generate

pnpm test                                  # todos os testes (unitários + integração)
pnpm exec vitest run tests/unit            # somente unitários (não exigem Docker)
pnpm test:integration                      # somente integração (exige Docker)
pnpm test:coverage                         # testes + relatório de cobertura
```

- A cobertura é medida sobre os **domínios críticos** (clientes, veículos/placa, ordens de serviço, orçamentos, acompanhamento, autenticação e relatórios) e o `vitest.config.ts` impõe **mínimo de 80%** em linhas, funções, branches e statements — o comando falha se o limite não for atingido.
- O relatório HTML é gerado em `coverage/`.
- Testes unitários: `tests/unit` (casos de uso e regras de domínio, com repositórios *fake* em `tests/support`).
- Testes de integração: `tests/integration` (rotas HTTP com banco PostgreSQL real via Testcontainers).

## 8. Acesso ao Swagger / documentação da API

Com a aplicação em execução, acesse a documentação interativa (OpenAPI renderizada com Scalar) em:

**http://localhost:3333/docs**

Rotas protegidas exigem o cabeçalho `Authorization: Bearer <accessToken>` (esquema `bearerAuth`).

**Principais endpoints**

| Grupo | Endpoints | Acesso |
|---|---|---|
| Auth | `POST /api/auth/login` | Público |
| Funcionários | `/api/employees` (CRUD) | JWT + perfil `ADMIN` |
| Clientes | `/api/customers` (CRUD) | JWT |
| Veículos | `/api/vehicles` (CRUD) | JWT |
| Serviços | `/api/services` (CRUD) | JWT |
| Peças e estoque | `/api/parts` (CRUD), `PATCH /api/parts/:id/stock`, `POST /api/parts/:id/stock/entries` | JWT |
| Ordens de serviço | `POST /api/work-orders`, `GET /api/work-orders`, `GET /api/work-orders/:id`, `POST /api/work-orders/:id/transitions` | JWT |
| Orçamentos | `GET /api/quotes/:id`, `POST /api/work-orders/:id/quote/send` | JWT |
| Acompanhamento do cliente | `GET /api/public/work-orders/:id` (cabeçalho `x-tracking-token`), `GET /api/public/work-orders/:id/track` (página) | Público, com token |
| Aprovação do orçamento | `GET /api/public/quotes/:id` (página), `POST /api/public/quotes/:id/decision` | Público, com token |
| Relatórios | `GET /api/reports/average-execution-time` | JWT |

## 9. Decisão e justificativa do banco de dados

**Banco escolhido: PostgreSQL 17** (acessado via Prisma ORM).

Justificativa:
- **Transações ACID**: os fluxos críticos (criar OS + itens + orçamento + notificação; aprovar orçamento + mudar status + baixar estoque) precisam ser atômicos. O PostgreSQL oferece transações robustas e o nível de isolamento `Serializable`, usado na criação da OS.
- **Modelo naturalmente relacional**: clientes, veículos, ordens, serviços, peças, orçamentos e itens da OS têm relacionamentos bem definidos, com integridade referencial e restrições de unicidade (CPF/CNPJ, placa, SKU, e-mail de funcionário).
- **Maturidade e custo**: open source, amplamente suportado, com imagem oficial para Docker e migrations versionadas pelo Prisma.
- **Adequação ao MVP**: uma oficina de médio porte não demanda a escala horizontal de bancos NoSQL; a consistência forte é mais valiosa que a flexibilidade de esquema.

## 10. Usuários, credenciais de demonstração e autenticação

**Procedimento de autenticação**

1. Defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mín. 12 caracteres) no `.env`. O *seed* (executado automaticamente pelo serviço `migrate` do Compose, ou por `pnpm db:seed`) cria/atualiza o funcionário administrador.
2. Faça login:

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'
```

3. Use o `accessToken` retornado nas demais rotas: `Authorization: Bearer <accessToken>`.
4. No Swagger/Scalar (`/docs`), informe o token no esquema `bearerAuth`.

**Credenciais de demonstração**

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador |admin@example.com |Password123!!45 |

**Perfis de funcionário:** `ADMIN`, `ATTENDANT` (atendente) e `MECHANIC` (mecânico). O gerenciamento de funcionários (`/api/employees`) é restrito a `ADMIN`; as demais rotas administrativas exigem um funcionário autenticado e ativo.

> O login possui *rate limit* de 5 tentativas por minuto.

## 11. Estrutura dos principais diretórios

```
.
├── prisma/
│   ├── models/              # Schema Prisma dividido por entidade
│   ├── migrations/          # Migrations versionadas
│   └── seed.ts              # Criação do administrador inicial
├── src/
│   ├── app.ts               # Composição da aplicação (injeção de dependências)
│   ├── server.ts            # Entrada da aplicação
│   ├── config/env.ts        # Validação das variáveis de ambiente
│   ├── modules/
│   │   ├── authentication/  # Login e emissão de JWT
│   │   ├── employees/       # Funcionários e perfis
│   │   ├── customers/       # Clientes (CPF/CNPJ)
│   │   ├── vehicles/        # Veículos (placa)
│   │   ├── services/        # Catálogo de serviços
│   │   ├── parts/           # Peças, insumos e estoque
│   │   ├── work-orders/     # Ordem de serviço, status e regras de transição
│   │   ├── quotes/          # Envio e decisão do orçamento
│   │   ├── public-tracking/ # Acompanhamento público da OS
│   │   └── reports/         # Tempo médio de execução
│   └── shared/              # Erros de domínio, plugins (auth, CORS, OpenAPI, Prisma), outbox de e-mails
├── tests/
│   ├── unit/                # Testes unitários
│   ├── integration/         # Testes de integração (Testcontainers)
│   └── support/             # Repositórios fake e apps de teste
├── docs/
│   ├── ddd/                 # Documentação DDD (Event Storming, diagramas, linguagem ubíqua)
│   └── security/            # Relatório de análise de vulnerabilidades
├── Dockerfile
├── docker-compose.yml
├── vitest.config.ts
└── .env.example
```

## 12. Documentação DDD

- Link da documentação no Drive (abrir com DRAW.IO): [`Documentação DDD`](https://drive.google.com/file/d/11hX5_6WXkaYHbTiVQrvltSG9iuZ5r_fx/view)
- Documentação exportada no repositório: [`docs/ddd/`](docs/ddd/)
  - [`event-storming`](docs/ddd/event-storming/)
  - [`diagramas.pdf`](docs/ddd/diagramas.pdf)
  - [`linguagem-ubiqua.md`](docs/ddd/linguagem-ubiqua.md)

## 13. Análise de vulnerabilidades

- Comando: `pnpm security:audit` (ou `pnpm security:audit:report`, que salva o resultado em `docs/security/`).
- Varredura usando Trivy (necessário docker, salva o resultado em `docs/security`)
```
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/docs/security:/out" aquasec/trivy:latest image --severity HIGH,CRITICAL --format table -o /out/trivy-image.txt auto-repair-api
docker run --rm -v "$PWD/src:/src" -v "$PWD/docs/security:/out" aquasec/trivy:latest fs --scanners vuln,secret,misconfig --format table -o /out/trivy-fs.txt .
```
- Relatórios:  [`docs/security/`](docs/security/)

## 14. Vídeo da entrega

- Link do vídeo: https://youtu.be/W4PtIxEsN8Q

---

### Versão entregue

- Branch: main