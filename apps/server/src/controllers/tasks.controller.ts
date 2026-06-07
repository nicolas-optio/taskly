import { Elysia, t } from "elysia";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../models/db";
import { tasks, categories } from "../models/schema";
import { authGuard } from "../lib/auth";
import { saveImage } from "../lib/upload";

// ===== CONTROLLER — Tarefas (rotas protegidas por JWT) =====

const taskBody = t.Object({
  title: t.String({ minLength: 1, error: "Título é obrigatório" }),
  description: t.Optional(t.String()),
  priority: t.Optional(
    t.Union([t.Literal("low"), t.Literal("medium"), t.Literal("high")], {
      error: "Prioridade deve ser low, medium ou high",
    })
  ),
  dueDate: t.Optional(
    t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$|^$", error: "Data deve estar no formato AAAA-MM-DD" })
  ),
  categoryId: t.Optional(t.String()),
  image: t.Optional(t.File()),
});

function findTask(id: number, userId: number) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .get();
}

export const tasksController = new Elysia({ prefix: "/tasks" })
  .use(authGuard)

  // Lista tarefas do usuário com filtros opcionais (?status=pending&categoryId=1)
  .get(
    "/",
    ({ query, userId }) => {
      const filters = [eq(tasks.userId, userId)];
      if (query.status) filters.push(eq(tasks.status, query.status));
      if (query.categoryId) filters.push(eq(tasks.categoryId, Number(query.categoryId)));

      return db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          dueDate: tasks.dueDate,
          imageUrl: tasks.imageUrl,
          categoryId: tasks.categoryId,
          categoryName: categories.name,
          categoryColor: categories.color,
          createdAt: tasks.createdAt,
        })
        .from(tasks)
        .leftJoin(categories, eq(tasks.categoryId, categories.id))
        .where(and(...filters))
        .orderBy(desc(tasks.createdAt))
        .all();
    },
    {
      query: t.Object({
        status: t.Optional(t.Union([t.Literal("pending"), t.Literal("done")])),
        categoryId: t.Optional(t.String()),
      }),
    }
  )

  // Cria tarefa (multipart/form-data — aceita imagem anexada)
  .post(
    "/",
    async ({ body, userId }) => {
      let imageUrl: string | null = null;
      if (body.image && body.image.size > 0) {
        imageUrl = await saveImage(body.image);
      }
      return db
        .insert(tasks)
        .values({
          title: body.title,
          description: body.description || null,
          priority: body.priority ?? "medium",
          dueDate: body.dueDate || null,
          categoryId: body.categoryId ? Number(body.categoryId) : null,
          imageUrl,
          userId,
        })
        .returning()
        .get();
    },
    { body: taskBody }
  )

  // Atualiza tarefa
  .put(
    "/:id",
    async ({ params, body, userId, status }) => {
      const task = await findTask(params.id, userId);
      if (!task) return status(404, { error: "Tarefa não encontrada" });

      let imageUrl = task.imageUrl;
      if (body.image && body.image.size > 0) {
        imageUrl = await saveImage(body.image);
      }
      return db
        .update(tasks)
        .set({
          title: body.title,
          description: body.description || null,
          priority: body.priority ?? task.priority,
          dueDate: body.dueDate || null,
          categoryId: body.categoryId ? Number(body.categoryId) : null,
          imageUrl,
        })
        .where(eq(tasks.id, params.id))
        .returning()
        .get();
    },
    { params: t.Object({ id: t.Number() }), body: taskBody }
  )

  // Alterna status pendente/concluída
  .patch(
    "/:id/toggle",
    async ({ params, userId, status }) => {
      const task = await findTask(params.id, userId);
      if (!task) return status(404, { error: "Tarefa não encontrada" });
      return db
        .update(tasks)
        .set({ status: task.status === "pending" ? "done" : "pending" })
        .where(eq(tasks.id, params.id))
        .returning()
        .get();
    },
    { params: t.Object({ id: t.Number() }) }
  )

  // Exclui tarefa
  .delete(
    "/:id",
    async ({ params, userId, status }) => {
      const task = await findTask(params.id, userId);
      if (!task) return status(404, { error: "Tarefa não encontrada" });
      await db.delete(tasks).where(eq(tasks.id, params.id)).run();
      return { ok: true };
    },
    { params: t.Object({ id: t.Number() }) }
  );
