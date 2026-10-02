/** Utilidades de fecha y estado compartidas por las pantallas de salud y servicios clínicos. */

export function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Formatea una fecha. Las fechas "YYYY-MM-DD" (sin hora) se interpretan en hora local;
 * `new Date('2026-05-10')` las toma como UTC y en México mostraría el día anterior.
 */
export function formatDateMx(value?: string | null, withYear = true): string {
    if (!value) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('es-MX', { year: withYear ? 'numeric' : undefined, month: 'short', day: 'numeric' });
}

export type StatusTone = { label: string; color: string; bg: string };

/** Estados genéricos (reservas, solicitudes, pólizas, órdenes) mapeados a tokens del tema. */
export function statusTone(theme: any, status?: string | null): StatusTone {
    switch ((status || '').toLowerCase()) {
        case 'confirmed':
        case 'confirmada':
        case 'approved':
        case 'aprobado':
        case 'active':
        case 'activa':
            return { label: labelFor(status), color: theme.success, bg: theme.successLight };
        case 'completed':
        case 'completada':
        case 'ready':
        case 'listo':
        case 'paid':
            return { label: labelFor(status), color: theme.info, bg: theme.infoLight };
        case 'cancelled':
        case 'canceled':
        case 'cancelada':
        case 'rejected':
        case 'rechazado':
        case 'expired':
            return { label: labelFor(status), color: theme.error, bg: theme.errorLight };
        default:
            return { label: labelFor(status), color: theme.warning, bg: theme.warningLight };
    }
}

const LABELS: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada', canceled: 'Cancelada',
    approved: 'Aprobado', rejected: 'Rechazado', active: 'Activa', expired: 'Vencida', ready: 'Listo', paid: 'Pagado',
    in_review: 'En revisión', processing: 'En proceso', in_progress: 'En proceso',
};

function labelFor(status?: string | null): string {
    const k = (status || 'pending').toLowerCase();
    return LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '));
}
