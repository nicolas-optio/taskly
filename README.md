# ✅ Taskly — Gerenciador de Tarefas

Trabalho N2 (2º bimestre) — Programação Mobile — Engenharia da Computação

Aplicação completa de gerenciamento de tarefas com app **React Native** consumindo APIs de um servidor **Node.js** com banco **SQLite**.

## Arquitetura

```
taskly/  (monorepo Turborepo)
├── apps/server   → API Node.js (Elysia) em arquitetura MVC
│   ├── src/models       → Model: schema Drizzle ORM + conexão SQLite
│   ├── src/controllers  → Controllers: auth, tasks, categories
│   └── src/lib          → JWT (guard) e upload de imagens
└── apps/mobile   → App React Native (Expo + TypeScript)
    ├── src/screens      → Login, Cadastro, Home, Formulário de tarefa
    ├── src/components   → Button, Input, Chip, TaskCard, Avatar...
    ├── src/context      → AuthContext (sessão JWT + AsyncStorage)
    └── src/api          → cliente HTTP das APIs
```

## Tecnologias e requisitos atendidos

| Requisito do trabalho | Implementação |
|---|---|
| Servidor Node.js (MVC) | Elysia rodando em Node.js (adapter `@elysiajs/node`), separado em models/controllers |
| Banco de dados | SQLite (arquivo `taskly.db`) |
| ORM | Drizzle ORM (`src/models/schema.ts`) |
| App React Native | Expo + TypeScript, React Navigation |
| Comunicação via API | REST/JSON + multipart (fetch) |
| JWT | `@elysiajs/jwt` — token exigido em todas as rotas de tarefas/categorias |
| Imagens (armazenar e exibir) | Upload multipart salvo em `apps/server/uploads/`, servido em `/uploads/*` e exibido no app (avatar do usuário + foto anexada à tarefa) |
| Validação no servidor | Schemas TypeBox do Elysia em todas as rotas (e-mail, senha mínima, título, formato de data, cor hex...) |
| Componentização/estilização | 7 componentes reutilizáveis + tema central (`src/theme.ts`) |

## Funcionalidades

- Cadastro com foto de perfil e login (JWT, sessão persistida)
- CRUD de tarefas com: descrição, prioridade (baixa/média/alta), data de vencimento (destaque para atrasadas), categoria colorida e imagem anexada
- Marcar como concluída/pendente (toggle)
- Filtros por status e por categoria
- Criação de categorias direto no formulário

## Como rodar

Requisitos: Node.js 20+ e o app **Expo Go** no celular (ou emulador).

```bash
# 1. Instalar dependências (na raiz do monorepo)
npm install

# 2. Subir o servidor (porta 3334)
npm run dev:server

# 3. Configurar o IP da API para o celular
#    apps/mobile/.env  (copie de .env.example)
#    EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3334

# 4. Subir o app (escaneie o QR code com o Expo Go)
npm run dev:mobile
```

O banco SQLite (`taskly.db`) e a pasta `uploads/` são criados automaticamente na primeira execução do servidor, dentro de `apps/server/`.

> Celular e computador precisam estar na mesma rede Wi-Fi. Descubra seu IP com `ipconfig getifaddr en0` (macOS) ou `ipconfig` (Windows).

## Rotas da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /auth/register | — | Cadastro (multipart, avatar opcional) |
| POST | /auth/login | — | Login → retorna JWT |
| GET | /me | JWT | Usuário logado |
| GET | /tasks?status=&categoryId= | JWT | Lista tarefas (filtros) |
| POST | /tasks | JWT | Cria tarefa (multipart, imagem opcional) |
| PUT | /tasks/:id | JWT | Atualiza tarefa |
| PATCH | /tasks/:id/toggle | JWT | Alterna pendente/concluída |
| DELETE | /tasks/:id | JWT | Exclui tarefa |
| GET | /categories | JWT | Lista categorias |
| POST | /categories | JWT | Cria categoria |
| DELETE | /categories/:id | JWT | Exclui categoria |
| GET | /uploads/:arquivo | — | Serve as imagens armazenadas |

## Integrantes

- Nicolas Gomes Lima — RA: ______
- ______________________ — RA: ______
# taskly
