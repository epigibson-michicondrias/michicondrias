/**
 * @module types/search
 * @description Búsqueda global. Espejo de `backend/michicondrias_core/app/schemas/search.py`.
 */

export interface SearchPetResult {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
}

export interface SearchClinicResult {
    id: string;
    name: string;
    city?: string | null;
    address?: string | null;
}

export interface SearchProductResult {
    id: string;
    name: string;
    price: number;
    category?: string | null;
    image_url?: string | null;
}

export interface SearchAdoptionResult {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    location?: string | null;
}

/** Sin datos de contacto: esos solo se ven en la ficha del reporte. */
export interface SearchLostPetResult {
    id: string;
    name?: string | null;
    species: string;
    report_type: 'lost' | 'found' | string;
    last_seen_location?: string | null;
}

export interface SearchServiceResult {
    id: string;
    name: string;
    kind: 'walker' | 'sitter' | string;
    location?: string | null;
}

export interface GlobalSearchResult {
    pets: SearchPetResult[];
    clinics: SearchClinicResult[];
    products: SearchProductResult[];
    /** F25: opcionales para tolerar un backend anterior. */
    adoptions?: SearchAdoptionResult[];
    lost_pets?: SearchLostPetResult[];
    services?: SearchServiceResult[];
}
