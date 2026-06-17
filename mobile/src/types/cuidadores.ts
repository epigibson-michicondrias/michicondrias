/**
 * @module types/cuidadores
 * @description Types for the pet sitters domain — sitter profiles and sit requests.
 */

// ─── Sitters ────────────────────────────────────────────────────────────────────

export interface Sitter {
    id: string;
    user_id: string;
    display_name: string;
    bio?: string | null;
    photo_url?: string | null;
    location?: string | null;
    price_per_day?: number | null;
    price_per_visit?: number | null;
    rating?: number;
    total_sits: number;
    is_verified: boolean;
    is_active: boolean;
    service_type: string;
    max_pets: number;
    has_yard: boolean;
    accepts_dogs: boolean;
    accepts_cats: boolean;
    experience_years?: number;
}

// ─── Sit Requests ───────────────────────────────────────────────────────────────

export interface SitRequest {
    id: string;
    sitter_id: string;
    client_user_id: string;
    pet_id: string;
    status: string;
    service_type: string;
    start_date: string;
    end_date: string;
    address?: string | null;
    notes?: string | null;
    total_price?: number | null;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Service type options for sitters */
export const SITTER_SERVICE_TYPE_OPTIONS = [
    { label: 'En casa del cuidador', value: 'boarding' },
    { label: 'Visitas a domicilio', value: 'drop-in' },
    { label: 'Cuidado en casa', value: 'house-sitting' },
] as const;

/** Sit request status options */
export const SIT_REQUEST_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Aceptada', value: 'accepted' },
    { label: 'Rechazada', value: 'rejected' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;
