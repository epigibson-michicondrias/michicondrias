import { apiFetch } from "../lib/api";
import type { GlobalSearchResult } from "../types/search";

export type { GlobalSearchResult };

export async function globalSearch(query: string): Promise<GlobalSearchResult> {
    return apiFetch<GlobalSearchResult>(
        "core",
        `/search/?q=${encodeURIComponent(query)}`
    );
}
