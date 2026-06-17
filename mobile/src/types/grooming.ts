/**
 * @module types/grooming
 * @description Types for the pet grooming domain — grooming appointments, before/after photos,
 * grooming files (pet profiles), services, and history.
 */

// ─── Grooming Appointments ──────────────────────────────────────────────────────

export interface GroomingAppointment {
    id: string;
    groomer_id: string;
    pet_id: string;
    date: string;
    time: string;
    service_type: string;
    status?: string;
    before_photo_url?: string;
    after_photo_url?: string;
    skin_report?: string;
}

export interface GroomingAppointmentCreate {
    groomer_id: string;
    pet_id: string;
    date: string;
    time: string;
    service_type: string;
    status?: string;
}

export interface GroomingAppointmentUpdatePhotos {
    before_photo_url?: string;
    after_photo_url?: string;
    status?: string;
    skin_report?: string;
}

// ─── Grooming File (Pet Profile) ────────────────────────────────────────────────

export interface GroomingFile {
    id: string;
    pet_id: string;
    hair_type?: string;
    preferred_shampoo?: string;
    behavior_notes?: string;
    allergies_detected?: string;
    last_service_date?: string;
}

export interface GroomingHistory {
    file?: GroomingFile;
    appointments: GroomingAppointment[];
}

// ─── Grooming Services ──────────────────────────────────────────────────────────

export interface GroomingService {
    id: string;
    groomer_id: string;
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
    created_at: string;
}

export interface GroomingServiceCreate {
    name: string;
    description?: string;
    price: number;
    duration_minutes?: number;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Hair type options */
export const HAIR_TYPE_OPTIONS = [
    { label: 'Corto', value: 'short' },
    { label: 'Medio', value: 'medium' },
    { label: 'Largo', value: 'long' },
    { label: 'Rizado', value: 'curly' },
    { label: 'Doble capa', value: 'double-coat' },
] as const;

/** Grooming appointment status options */
export const GROOMING_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Confirmada', value: 'confirmed' },
    { label: 'En progreso', value: 'in-progress' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;
