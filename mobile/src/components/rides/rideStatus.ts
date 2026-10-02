/**
 * Utilidades de presentación de viajes (estado, dinero, fechas). Los colores salen del tema.
 */
import type { PetRide, RideStatus } from '@/src/types/rides';
import { RIDE_STATUS_LABELS } from '@/src/types/rides';

export function rideStatusInfo(status: string, theme: any): { label: string; color: string } {
    const label = RIDE_STATUS_LABELS[status as RideStatus] ?? status;
    switch (status as RideStatus) {
        case 'pending':
            return { label, color: theme.warning };
        case 'accepted':
            return { label, color: theme.info };
        case 'in_transit':
            return { label, color: theme.primary };
        case 'completed':
            return { label, color: theme.success };
        case 'cancelled':
        case 'rejected':
            return { label, color: theme.error };
        default:
            return { label, color: theme.textMuted };
    }
}

export function formatMoney(value?: number | null): string {
    return value == null ? '—' : `$${Number(value).toFixed(2)}`;
}

export function formatDateTime(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Fecha de referencia para ordenar/mostrar: programada, o la de creación. */
export function rideWhen(r: PetRide): string {
    return formatDateTime(r.scheduled_at || r.created_at);
}
