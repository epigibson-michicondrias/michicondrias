/**
 * Estados de una solicitud de adopción (fuente única): etiqueta en español y color.
 * `APPROVED` es la pre-aprobación; la adopción se concreta con «Aprobar adopción» (`ADOPTED`).
 */
export type RequestTone = "warning" | "info" | "primary" | "success" | "accent" | "error";

export const REQUEST_STATUS: Record<string, { label: string; tone: RequestTone }> = {
  PENDING: { label: "Pendiente", tone: "warning" },
  REVIEWING: { label: "En revisión", tone: "info" },
  INTERVIEW_SCHEDULED: { label: "Entrevista programada", tone: "primary" },
  APPROVED: { label: "Pre-aprobada", tone: "success" },
  ADOPTED: { label: "Adoptado", tone: "accent" },
  REJECTED: { label: "Rechazada", tone: "error" },
};

const TONE_COLOR: Record<RequestTone, string> = {
  warning: "var(--warning)",
  info: "var(--info)",
  primary: "var(--primary)",
  success: "var(--success)",
  accent: "var(--accent)",
  error: "var(--error)",
};

export function requestStatusInfo(status: string | null | undefined) {
  return REQUEST_STATUS[(status ?? "").toUpperCase()] ?? REQUEST_STATUS.PENDING;
}

export function requestStatusColor(status: string | null | undefined): string {
  return TONE_COLOR[requestStatusInfo(status).tone];
}

/** Qué sigue según el estado (lo ve quien publicó). */
export const NEXT_STEP: Record<string, string> = {
  PENDING: "Revisa los datos y decide si sigue adelante.",
  REVIEWING: "Agenda una entrevista o aprueba la adopción.",
  INTERVIEW_SCHEDULED: "Después de la entrevista, aprueba o rechaza.",
  APPROVED: "Pre-aprobada: confirma la adopción cuando entregues a la mascota.",
  ADOPTED: "La adopción se concretó. La mascota ya está en la cuenta de quien adoptó.",
  REJECTED: "Esta solicitud se cerró.",
};
