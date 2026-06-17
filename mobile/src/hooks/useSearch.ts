import { useMemo, useState } from 'react';

interface UseSearchOptions<T> {
    items: T[];
    fields: (keyof T)[];
    query: string;
}

export function useSearch<T>({ items, fields, query }: UseSearchOptions<T>): T[] {
    return useMemo(() => {
        if (!query.trim()) return items;
        const lower = query.toLowerCase();
        return items.filter(item =>
            fields.some(field => {
                const val = item[field];
                return val != null && String(val).toLowerCase().includes(lower);
            })
        );
    }, [items, fields, query]);
}
