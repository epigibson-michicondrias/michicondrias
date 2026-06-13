import { apiFetch } from "@/lib/api";

export interface SearchPetResult {
    id: string;
    name: string;
    species: string;
    breed?: string;
}

export interface SearchClinicResult {
    id: string;
    name: string;
    city?: string;
    address?: string;
}

export interface SearchProductResult {
    id: string;
    name: string;
    price: number;
}

export interface GlobalSearchResponse {
    pets: SearchPetResult[];
    clinics: SearchClinicResult[];
    products: SearchProductResult[];
}

export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
    if (!query || query.length < 2) {
        return { pets: [], clinics: [], products: [] };
    }
    return apiFetch<GlobalSearchResponse>("core", `/search/?q=${encodeURIComponent(query)}`);
}
