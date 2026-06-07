import { Elysia, t } from "elysia";
import { and, eq } from "drizzle-orm";
import { db } from "../models/db";
import { categories } from "../models/schema";
import { authGuard } from "../lib/auth";

// ===== CONTROLLER — Categorias (rotas protegidas por JWT) =====

export const categoriesController = new Elysia({ prefix: "/categories" })
  .use(authGuard)

  .get("/", ({ userId }) =>
    db.select().from(categories).where(eq(categories.userId, userId)).all()
  )

  .post(
    "/",
    ({ body, userId }) =>
      db
        .insert(categories)
        .values({ name: body.name, color: body.color ?? "#6366f1", userId })
        .returning()
        .get(),
    {
      body: t.Object({
        name: t.String({ minLength: 1, error: "Nome da categoria é obrigatório" }),
        color: t.Optional(t.String({ pattern: "^#[0-9a-fA-F]{6}$", error: "Cor deve ser hex (#rrggbb)" })),
      }),
    }
  )

  .delete(
    "/:id",
    async ({ params, userId, status }) => {
      const deleted = await db
        .delete(categories)
        .where(and(eq(categories.id, params.id), eq(categories.userId, userId)))
        .returning()
        .get();
      if (!deleted) return status(404, { error: "Categoria não encontrada" });
      return { ok: true };
    },
    { params: t.Object({ id: t.Number() }) }
  );
