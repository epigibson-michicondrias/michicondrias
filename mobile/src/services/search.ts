import { apiFetch } from "../lib/api";

export interface GlobalSearchResult {
    pets: any[];
    clinics: any[];
    products: any[];
}

export async function globalSearch(query: string): Promise<GlobalSearchResult> {
    return apiFetch<GlobalSearchResult>(
        "core",
        `/search/?q=${encodeURIComponent(query)}`
    );
}
