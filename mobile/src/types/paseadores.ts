/**
 * @module types/paseadores
 * @description Types for the dog walkers domain — walker profiles and walk requests.
 */

// ─── Walkers ────────────────────────────────────────────────────────────────────

export interface Walker {
    id: string;
    user_id: string;
    display_name: string;
    bio?: string | null;
    photo_url?: string | null;
    location?: string | null;
    price_per_walk?: number | null;
    price_per_hour?: number | null;
    rating?: number;
    total_walks: number;
    is_verified: boolean;
    is_active: boolean;
    experience_years?: number;
    accepts_dogs: boolean;
    accepts_cats: boolean;
    max_pets_per_walk: number;
    service_radius_km?: number;
    schedule_preference?: string | null;
    gallery?: string | null;
}

// ─── Walk Requests ──────────────────────────────────────────────────────────────

export interface WalkRequest {
    id: string;
    walker_id: string;
    client_user_id: string;
    pet_id: string;
    status: string;
    requested_date: string;
    requested_time?: string | null;
    duration_minutes: number;
    pickup_address?: string | null;
    notes?: string | null;
    total_price?: number | null;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Walk request status options */
export const WALK_REQUEST_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Aceptada', value: 'accepted' },
    { label: 'Rechazada', value: 'rejected' },
    { label: 'En progreso', value: 'in-progress' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;

/** Duration options in minutes */
export const WALK_DURATION_OPTIONS = [
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hora', value: 60 },
    { label: '1.5 horas', value: 90 },
    { label: '2 horas', value: 120 },
] as const;
