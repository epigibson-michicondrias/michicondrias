/**
 * Estados de las solicitudes de paseo/cuidado (espejo de `mobile/src/hooks/servicios-pro/requestStatus.ts`):
 * pending -> accepted -> in_progress -> completed, y cancelled desde cualquiera de los abiertos.
 * "confirmed" es el nombre que usaban versiones anteriores de la app para "accepted".
 */
export type RequestStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export type RequestTone = "warning" | "success" | "info" | "primary" | "error";

export function normalizeStatus(status?: string | null): RequestStatus {
  switch (status) {
    case "accepted":
    case "confirmed":
      return "accepted";
    case "in_progress":
    case "completed":
    case "cancelled":
      return status;
    default:
      return "pending";
  }
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const TONE_COLOR: Record<RequestTone, string> = {
  warning: "var(--color-warning)",
  success: "var(--color-success)",
  info: "var(--color-info)",
  primary: "var(--color-primary)",
  error: "var(--color-error)",
};

const STATUS_TONE: Record<RequestStatus, RequestTone> = {
  accepted: "success",
  in_progress: "info",
  completed: "primary",
  cancelled: "error",
  pending: "warning",
};

/** Color del estado con los tokens del tema. */
export function statusColor(status: string | undefined | null): string {
  return TONE_COLOR[STATUS_TONE[normalizeStatus(status)]];
}

/** Filtros de estado para las listas (el id coincide con el estado normalizado). */
export const STATUS_FILTERS: { id: "all" | RequestStatus; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "accepted", label: "Aceptadas" },
  { id: "in_progress", label: "En curso" },
  { id: "completed", label: "Completadas" },
  { id: "cancelled", label: "Canceladas" },
];

/** Formatea una fecha ISO (AAAA-MM-DD) como "12 oct 2026" sin desfases de zona horaria. */
export function formatIsoDate(iso?: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.substring(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/** Fecha local del dispositivo como AAAA-MM-DD (toISOString la desplaza a UTC y puede dar el día siguiente). */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function errorMessage(error: unknown, fallback: string): string {
  const msg = (error as { message?: unknown })?.message;
  return typeof msg === "string" && msg && !/^Error \d+$/.test(msg) ? msg : fallback;
}
