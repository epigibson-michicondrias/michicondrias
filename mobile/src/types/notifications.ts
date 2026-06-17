/**
 * @module types/notifications
 * @description Types for the notifications domain — user notifications.
 */

// ─── Notifications ──────────────────────────────────────────────────────────────

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Notification type options */
export const NOTIFICATION_TYPE_OPTIONS = [
    { label: 'General', value: 'general' },
    { label: 'Cita', value: 'appointment' },
    { label: 'Alerta', value: 'alert' },
    { label: 'Recordatorio', value: 'reminder' },
    { label: 'Promoción', value: 'promotion' },
] as const;
