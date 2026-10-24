/**
 * useAdminProducts — productos de la tienda con búsqueda y filtro por estado (publicado, en revisión, agotado).
 * Espejo de `mobile/src/hooks/admin/useAdminProducts.ts` (allí el buscador no filtraba).
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, type Product } from '@/services/ecommerce';

export type { Product };
export type ProductFilter = 'all' | 'review' | 'out' | 'hidden';

const MATCH: Record<ProductFilter, (p: Product) => boolean> = {
    all: () => true,
    review: (p) => p.is_approved === false,
    out: (p) => p.stock <= 0,
    hidden: (p) => !p.is_active,
};

export function useAdminProducts() {
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ProductFilter>('all');
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => getProducts({ limit: 200 }),
    });

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return products.filter((p) => MATCH[filter](p) && (!q || p.name.toLowerCase().includes(q)));
    }, [products, searchText, filter]);

    return {
        products: filtered,
        total: products.length,
        count: (f: ProductFilter) => products.filter(MATCH[f]).length,
        isLoading,
        searchText,
        setSearchText,
        filter,
        setFilter,
    };
}
