import { Elysia, t } from "elysia";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../models/db";
import { users } from "../models/schema";
import { jwtPlugin, authGuard } from "../lib/auth";
import { saveImage } from "../lib/upload";

// ===== CONTROLLER (camada C do MVC) — Autenticação =====

const publicUser = (u: typeof users.$inferSelect) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarUrl,
});

export const authController = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)

  // Cadastro (multipart: aceita avatar opcional)
  .post(
    "/register",
    async ({ body, jwt, status }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .get();
      if (existing) {
        return status(409, { error: "E-mail já cadastrado" });
      }

      let avatarUrl: string | null = null;
      if (body.avatar && body.avatar.size > 0) {
        avatarUrl = await saveImage(body.avatar);
      }

      const passwordHash = bcrypt.hashSync(body.password, 10);
      const user = await db
        .insert(users)
        .values({ name: body.name, email: body.email, passwordHash, avatarUrl })
        .returning()
        .get();

      const token = await jwt.sign({ sub: String(user.id) });
      return { token, user: publicUser(user) };
    },
    {
      // Validação dos dados de entrada
      body: t.Object({
        name: t.String({ minLength: 2, error: "Nome deve ter ao menos 2 caracteres" }),
        email: t.String({ format: "email", error: "E-mail inválido" }),
        password: t.String({ minLength: 6, error: "Senha deve ter ao menos 6 caracteres" }),
        avatar: t.Optional(t.File()),
      }),
    }
  )

  // Login
  .post(
    "/login",
    async ({ body, jwt, status }) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .get();
      if (!user || !bcrypt.compareSync(body.password, user.passwordHash)) {
        return status(401, { error: "E-mail ou senha incorretos" });
      }
      const token = await jwt.sign({ sub: String(user.id) });
      return { token, user: publicUser(user) };
    },
    {
      body: t.Object({
        email: t.String({ format: "email", error: "E-mail inválido" }),
        password: t.String({ minLength: 1, error: "Senha obrigatória" }),
      }),
    }
  );

// Rota protegida: dados do usuário logado
export const meController = new Elysia()
  .use(authGuard)
  .get("/me", async ({ userId, status }) => {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return status(404, { error: "Usuário não encontrado" });
    return publicUser(user);
  });
