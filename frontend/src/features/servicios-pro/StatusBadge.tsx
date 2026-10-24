"use client";

/**
 * StatusBadge — badge de estado unificado para solicitudes de paseo/cuidado.
 * Espejo de `mobile/src/features/servicios-pro/StatusBadge.tsx`.
 */
import { normalizeStatus, STATUS_LABELS, statusColor } from "./requestStatus";
import s from "./servicios-pro.module.css";

interface StatusBadgeProps {
  status?: string | null;
  /** Etiqueta personalizada (sobrescribe la del estado). */
  label?: string;
  /** Muestra un punto de color antes del texto. */
  dot?: boolean;
}

export default function StatusBadge({ status, label, dot }: StatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const text = label ?? STATUS_LABELS[normalized];
  return (
    <span className={s.statusBadge} style={{ ["--c" as string]: statusColor(status) }} aria-label={`Estado: ${text}`}>
      {dot ? <span className={s.statusDot} aria-hidden /> : null}
      {text}
    </span>
  );
}
