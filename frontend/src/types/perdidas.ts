/**
 * @module types/perdidas
 * @description Types for the lost & found pets domain — lost/found pet reports
 * including Michi-Tracker Pro GPS tracking fields.
 */

// ─── Lost Pet Reports ───────────────────────────────────────────────────────────

export interface LostPetReport {
    id: string;
    reporter_id: string;
    pet_name: string;
    species: string;
    breed: string | null;
    color: string | null;
    size: string | null;
    age_approx: string | null;
    description: string | null;
    image_url: string | null;
    report_type: 'lost' | 'found';
    last_seen_location: string | null;
    latitude: number | null;
    longitude: number | null;
    contact_phone: string | null;
    contact_email: string | null;
    status: string;
    is_resolved: boolean;
    created_at: string | null;

    // Michi-Tracker Pro fields
    has_tracker: boolean;
    tracker_device_id: string | null;
    current_lat: number | null;
    current_lng: number | null;
    last_tracked_at: string | null;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Report type options */
export const REPORT_TYPE_OPTIONS = [
    { label: 'Perdido', value: 'lost' },
    { label: 'Encontrado', value: 'found' },
] as const;

/** Pet size options for reports */
export const PET_SIZE_OPTIONS = [
    { label: 'Pequeño', value: 'small' },
    { label: 'Mediano', value: 'medium' },
    { label: 'Grande', value: 'large' },
] as const;

/** Species options for reports */
export const REPORT_SPECIES_OPTIONS = [
    { label: 'Perro', value: 'dog' },
    { label: 'Gato', value: 'cat' },
    { label: 'Otro', value: 'other' },
] as const;
