import AsyncStorage from "@react-native-async-storage/async-storage";

// ===== Comunicação com o servidor Node.js via API REST =====
// Para testar no celular físico, defina o IP da sua máquina em
// apps/mobile/.env  ->  EXPO_PUBLIC_API_URL=http://192.168.0.10:3334
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3334";

export const TOKEN_KEY = "@taskly/token";
export const USER_KEY = "@taskly/user";

/** Converte o caminho relativo salvo no banco (/uploads/x.png) em URL absoluta */
export function imageUrl(path: string | null | undefined): string | null {
  return path ? `${API_URL}${path}` : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // JWT enviado em todas as requisições autenticadas
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      data?.error ?? data?.message ?? `Erro ${res.status} ao chamar a API`
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  // multipart/form-data — usado quando há imagem anexada
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),

  putForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "PUT", body: form }),

  patch: <T>(path: string) => request<T>(path, { method: "PATCH" }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
