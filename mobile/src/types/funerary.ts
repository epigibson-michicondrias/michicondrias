/**
 * @module types/funerary
 * @description Types for the pet funerary domain — death reports, memorial posts,
 * funerary service catalog, and booking management.
 */

// ─── Pet Death Reports ──────────────────────────────────────────────────────────

export interface PetDeath {
    id: string;
    pet_id: string;
    funerary_id: string;
    date_of_death: string;
    cause_of_death?: string;
    cremation_type?: string;
    urn_model?: string;
    certificate_url?: string;
    notes?: string;
    created_at?: string;
}

export interface PetDeathCreate {
    pet_id: string;
    date_of_death: string;
    cause_of_death?: string;
    cremation_type?: string;
    urn_model?: string;
    certificate_url?: string;
    notes?: string;
}

// ─── Memorial Posts ─────────────────────────────────────────────────────────────

export interface PetMemorialPost {
    id: string;
    pet_id: string;
    user_id: string;
    message: string;
    photo_url?: string;
    created_at?: string;
}

export interface PetMemorialPostCreate {
    pet_id: string;
    message: string;
    photo_url?: string;
}

// ─── Funerary Services ─────────────────────────────────────────────────────────

export interface FuneraryService {
    id: string;
    funerary_id: string;
    name: string;
    description?: string;
    price: number;
    cremation_type?: string;
    urn_included: boolean;
    is_active: boolean;
    created_at?: string;
}

export interface FuneraryServiceCreate {
    name: string;
    description?: string;
    price: number;
    cremation_type?: string;
    urn_included?: boolean;
}

// ─── Funerary Bookings ─────────────────────────────────────────────────────────

export interface FuneraryBooking {
    id: string;
    client_id: string;
    pet_id: string;
    service_id: string;
    scheduled_date: string;
    status: string;
    notes?: string;
    created_at?: string;
}

export interface FuneraryBookingCreate {
    pet_id: string;
    service_id: string;
    scheduled_date: string;
    notes?: string;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Cremation type options */
export const CREMATION_TYPE_OPTIONS = [
    { label: 'Individual', value: 'individual' },
    { label: 'Grupal', value: 'group' },
    { label: 'Privada', value: 'private' },
] as const;

/** Funerary booking status options */
export const FUNERARY_BOOKING_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Confirmada', value: 'confirmed' },
    { label: 'En proceso', value: 'in-progress' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;
