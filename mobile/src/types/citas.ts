/**
 * @module types/citas
 * @description Types for the appointments (citas) domain — appointment scheduling
 * with enrichment fields for display.
 */

// ─── Appointments ───────────────────────────────────────────────────────────────

export interface Appointment {
    id: string;
    clinic_id: string;
    pet_id: string;
    service_id: string | null;
    appointment_date: string;
    reason: string;
    status: string; // scheduled, confirmed, completed, cancelled
    is_emergency: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;

    // Enrichment fields
    clinic_name?: string;
    pet_name?: string;
    service_name?: string;
}

export interface AppointmentCreate {
    clinic_id: string;
    pet_id: string;
    service_id?: string | null;
    appointment_date: string;
    reason: string;
    is_emergency?: boolean;
    status?: string;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Appointment status options */
export const CITA_STATUS_OPTIONS = [
    { label: 'Programada', value: 'scheduled' },
    { label: 'Confirmada', value: 'confirmed' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;

/** Default values for creating a new appointment */
export const APPOINTMENT_CREATE_DEFAULTS: AppointmentCreate = {
    clinic_id: '',
    pet_id: '',
    service_id: null,
    appointment_date: '',
    reason: '',
    is_emergency: false,
};
