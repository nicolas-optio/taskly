import { mkdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/**
 * Salva uma imagem enviada via multipart/form-data na pasta /uploads
 * e retorna a URL pública para ser exibida no app.
 */
export async function saveImage(file: File): Promise<string> {
  const ext = (extname(file.name) || ".jpg").toLowerCase();
  if (!ALLOWED.includes(ext)) {
    throw new Error("Formato de imagem inválido. Use jpg, png, gif ou webp.");
  }
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}
