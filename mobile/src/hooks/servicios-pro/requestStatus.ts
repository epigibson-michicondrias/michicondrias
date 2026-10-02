/**
 * Estados de las solicitudes de paseo/cuidado (los mismos que valida el backend):
 * pending -> accepted -> in_progress -> completed, y cancelled desde cualquiera de los abiertos.
 * "confirmed" es el nombre que usaban versiones anteriores de la app para "accepted".
 */
export type RequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export function normalizeStatus(status?: string | null): RequestStatus {
    switch (status) {
        case 'accepted':
        case 'confirmed':
            return 'accepted';
        case 'in_progress':
        case 'completed':
        case 'cancelled':
            return status;
        default:
            return 'pending';
    }
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
};

/** Color y fondo del estado, tomados de los tokens del tema. */
export function getStatusColors(status: string | undefined | null, theme: any): { color: string; bg: string } {
    switch (normalizeStatus(status)) {
        case 'accepted':
            return { color: theme.success, bg: theme.successLight };
        case 'in_progress':
            return { color: theme.info, bg: theme.infoLight };
        case 'completed':
            return { color: theme.primary, bg: theme.primaryLight };
        case 'cancelled':
            return { color: theme.error, bg: theme.errorLight };
        default:
            return { color: theme.warning, bg: theme.warningLight };
    }
}

/** Filtros de estado para las listas (el id coincide con el estado normalizado). */
export const STATUS_FILTERS: { id: 'all' | RequestStatus; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'accepted', label: 'Aceptadas' },
    { id: 'in_progress', label: 'En curso' },
    { id: 'completed', label: 'Completadas' },
    { id: 'cancelled', label: 'Canceladas' },
];

/** Formatea una fecha ISO (AAAA-MM-DD) como "12 oct 2026" sin desfases de zona horaria. */
export function formatIsoDate(iso?: string | null): string {
    if (!iso) return '';
    const [y, m, d] = iso.substring(0, 10).split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Fecha local del dispositivo como AAAA-MM-DD (toISOString la desplaza a UTC y puede dar el día siguiente). */
export function toLocalIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function errorMessage(error: unknown, fallback: string): string {
    const msg = (error as any)?.message;
    return typeof msg === 'string' && msg && !/^Error \d+$/.test(msg) ? msg : fallback;
}
