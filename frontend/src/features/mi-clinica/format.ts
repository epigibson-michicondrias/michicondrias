/** Utilidades de fecha y estado de las pantallas clínicas (espejo de `mobile/src/features/salud/format.ts`). */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Formatea una fecha. Las "YYYY-MM-DD" se leen en hora local (como UTC mostrarían el día anterior en México). */
export function formatDateMx(value?: string | null, withYear = true): string {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-MX", { year: withYear ? "numeric" : undefined, month: "short", day: "numeric" });
}

const LABELS: Record<string, string> = {
  pending: "Pendiente", confirmed: "Confirmada", completed: "Completada", cancelled: "Cancelada", canceled: "Cancelada",
  approved: "Aprobado", rejected: "Rechazado", active: "Activa", expired: "Vencida", ready: "Listo", paid: "Pagado",
  in_review: "En revisión", processing: "En proceso", in_progress: "En proceso", scheduled: "Programada",
};

function labelFor(status?: string | null): string {
  const k = (status || "pending").toLowerCase();
  return LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ");
}

/** Estado genérico → etiqueta y color del tema (para `Badge`). */
export function statusTone(status?: string | null): { label: string; color: string } {
  switch ((status || "").toLowerCase()) {
    case "confirmed": case "confirmada": case "approved": case "aprobado": case "active": case "activa":
      return { label: labelFor(status), color: "var(--color-success)" };
    case "completed": case "completada": case "ready": case "listo": case "paid":
      return { label: labelFor(status), color: "var(--color-info)" };
    case "cancelled": case "canceled": case "cancelada": case "rejected": case "rechazado": case "expired":
      return { label: labelFor(status), color: "var(--color-error)" };
    default:
      return { label: labelFor(status), color: "var(--color-warning)" };
  }
}
