# 🎬 Roteiro do vídeo (máx. 5 minutos)

O enunciado avisa: **tópico não explicado no vídeo = considerado não implementado.**
Os tópicos avaliados são: servidor Node, banco de dados, app React Native, imagens, JWT (implícito nos requisitos) e ORM.

Sugestão: grave com o servidor rodando num terminal visível + app no celular/emulador.

## 0:00 – 0:30 — Apresentação
- Nomes e RAs da dupla.
- "Desenvolvemos o **Taskly**, um gerenciador de tarefas: app React Native que consome a API de um servidor Node.js com banco SQLite."
- Mostre a estrutura do monorepo no editor: `apps/server` e `apps/mobile`.

## 0:30 – 1:30 — Tópico 1: Servidor Node.js (MVC)
- Mostre `apps/server/src/index.ts`: Elysia rodando **em Node.js** (adapter `@elysiajs/node`) e o comentário da arquitetura MVC.
- Mostre a pasta `controllers/` (auth, tasks, categories) e `models/`.
- Destaque a **validação dos dados**: abra `auth.controller.ts` e aponte o schema do body (e-mail válido, senha mínima de 6). Se der tempo, mostre no Insomnia/curl um 422.

## 1:30 – 2:15 — Tópicos 2 e 7: Banco de dados + ORM
- Abra `src/models/schema.ts`: tabelas `users`, `categories` e `tasks` definidas com **Drizzle ORM**, com relacionamentos (FK de tasks → categories e users).
- Abra `src/models/db.ts`: conexão **SQLite** (arquivo `taskly.db`).
- Mostre uma query do ORM em `tasks.controller.ts` (select com `leftJoin` de categorias).
- Opcional: abra o arquivo taskly.db com `npx drizzle-kit studio` ou um visualizador SQLite.

## 2:15 – 3:45 — Tópico 4: App React Native (demonstração)
- **Cadastro** escolhendo a foto de perfil → entre direto no app.
- Aponte a **componentização**: pasta `src/components` (TaskCard, Chip, Button, Input, Avatar) e a **estilização** com tema central (`src/theme.ts`).
- Crie uma tarefa: título, prioridade alta, data de vencimento, categoria nova, **anexando uma imagem da galeria**.
- Mostre a lista: badge de prioridade colorida, categoria, data, miniatura da imagem.
- Marque como concluída, use os filtros (Pendentes/Concluídas/categoria).
- Diga: "toda ação chama a API do servidor via fetch — nada é salvo localmente além do token".

## 3:45 – 4:20 — Tópico 5: Imagens (armazenar e exibir)
- Mostre a pasta `apps/server/uploads/` com os arquivos salvos.
- Abra no navegador `http://localhost:3334/uploads/<arquivo>.jpg` provando que o servidor armazena e serve a imagem.
- Mostre o avatar no header e a foto no card da tarefa (exibição no app).

## 4:20 – 5:00 — JWT + encerramento
- Mostre `src/lib/auth.ts` (guard que exige `Authorization: Bearer`).
- Demonstre: chamada a `/tasks` **sem token → 401**; com token → 200 (curl ou Insomnia).
- Mostre no app que o login persiste (AsyncStorage) e o botão Sair.
- Encerre: "Servidor Node com Elysia, SQLite com Drizzle ORM, JWT, upload de imagens e app React Native componentizado."

## ✔️ Checklist antes de postar no Moodle
- [ ] Apagar **node_modules** (raiz, apps/server e apps/mobile)
- [ ] Apagar `taskly.db` e a pasta `uploads/` (opcional, mas deixa o zip limpo)
- [ ] Vídeo ≤ 5 min cobrindo TODOS os tópicos acima
- [ ] Documento .doc preenchido com nomes e RAs
- [ ] Testar `npm install` + `npm run dev:server` numa pasta limpa antes de enviar
