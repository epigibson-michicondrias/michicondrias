/**
 * Estados de una solicitud de adopción (fuente única): etiqueta en español y tono del tema.
 * `APPROVED` es la pre-aprobación; la adopción se concreta con «Aprobar adopción» (`ADOPTED`).
 */
import { useTheme } from '@/src/hooks/useTheme';

export type RequestTone = 'warning' | 'info' | 'primary' | 'success' | 'accent' | 'error';

export const REQUEST_STATUS: Record<string, { label: string; tone: RequestTone }> = {
    PENDING: { label: 'Pendiente', tone: 'warning' },
    REVIEWING: { label: 'En revisión', tone: 'info' },
    INTERVIEW_SCHEDULED: { label: 'Entrevista programada', tone: 'primary' },
    APPROVED: { label: 'Pre-aprobada', tone: 'success' },
    ADOPTED: { label: 'Adoptado', tone: 'accent' },
    REJECTED: { label: 'Rechazada', tone: 'error' },
};

export function requestStatusInfo(status: string | null | undefined) {
    return REQUEST_STATUS[(status ?? '').toUpperCase()] ?? REQUEST_STATUS.PENDING;
}

/** `(status) => { label, tone, color }` con el color del tema actual. */
export function useRequestStatus() {
    const { theme } = useTheme();
    return (status: string | null | undefined) => {
        const info = requestStatusInfo(status);
        return { ...info, color: theme[info.tone] as string };
    };
}
