/**
 * @module types/petfriendly
 * @description Types for the pet-friendly places domain — places that welcome pets
 * with amenity details and ratings.
 */

// ─── Pet-Friendly Places ────────────────────────────────────────────────────────

export interface PetfriendlyPlace {
    id: string;
    added_by: string;
    name: string;
    category: string;
    address: string | null;
    city: string | null;
    description: string | null;
    image_url: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    website: string | null;
    rating: number;
    pet_sizes_allowed: string;
    has_water_bowls: string;
    has_pet_menu: string;
    created_at: string | null;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Place category options */
export const PETFRIENDLY_CATEGORY_OPTIONS = [
    { label: 'Restaurante', value: 'restaurant' },
    { label: 'Café', value: 'cafe' },
    { label: 'Hotel', value: 'hotel' },
    { label: 'Parque', value: 'park' },
    { label: 'Tienda', value: 'store' },
    { label: 'Playa', value: 'beach' },
    { label: 'Otro', value: 'other' },
] as const;
