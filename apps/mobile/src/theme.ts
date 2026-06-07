// Tema central do app — usado por todos os componentes (estilização)
export const colors = {
  background: "#f1f5f9",
  surface: "#ffffff",
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

export const priorityColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export const radius = { sm: 8, md: 12, lg: 16, full: 999 };
