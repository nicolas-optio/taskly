import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const JWT_SECRET = process.env.JWT_SECRET ?? "taskly-secret-trocar-em-producao";

// Plugin JWT reutilizável (assinatura e verificação de tokens)
export const jwtPlugin = jwt({
  name: "jwt",
  secret: JWT_SECRET,
  exp: "7d",
});

/**
 * Guard de autenticação: exige header "Authorization: Bearer <token>"
 * em todas as rotas que usarem este plugin. Disponibiliza `userId` no contexto.
 */
export const authGuard = new Elysia({ name: "authGuard" })
  .use(jwtPlugin)
  .resolve({ as: "scoped" }, async ({ jwt, headers, status }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return status(401, { error: "Token não informado" });
    }
    const payload = await jwt.verify(auth.slice(7));
    if (!payload || typeof payload.sub !== "string") {
      return status(401, { error: "Token inválido ou expirado" });
    }
    return { userId: Number(payload.sub) };
  });
