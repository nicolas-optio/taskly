import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { authController, meController } from "./controllers/auth.controller";
import { tasksController } from "./controllers/tasks.controller";
import { categoriesController } from "./controllers/categories.controller";

// ===== Servidor Node.js (Elysia com adapter Node) =====
// Arquitetura MVC:
//   Model      -> src/models (schema Drizzle + conexão SQLite)
//   View       -> respostas JSON consumidas pelo app React Native
//   Controller -> src/controllers (regras de negócio das rotas)

const PORT = Number(process.env.PORT ?? 3334);

const app = new Elysia({ adapter: node() })
  .use(cors())
  // Serve as imagens armazenadas no servidor (GET /uploads/<arquivo>)
  .use(staticPlugin({ assets: "uploads", prefix: "/uploads" }))
  .get("/", () => ({ name: "Taskly API", status: "ok" }))
  .use(authController)
  .use(meController)
  .use(categoriesController)
  .use(tasksController)
  .listen(PORT, () => {
    console.log(`🚀 Taskly API rodando em http://localhost:${PORT}`);
  });

export type App = typeof app;
