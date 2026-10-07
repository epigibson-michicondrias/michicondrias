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

export interface GlobalSearchResult {
    pets: SearchPetResult[];
    clinics: SearchClinicResult[];
    products: SearchProductResult[];
}
