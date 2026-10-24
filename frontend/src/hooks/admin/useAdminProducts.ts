/**
 * useAdminProducts — productos de la tienda con búsqueda y filtro por estado (publicado, en revisión, agotado).
 * Espejo de `mobile/src/hooks/admin/useAdminProducts.ts` (allí el buscador no filtraba).
 * `GET /products/` solo da el catálogo público (activos y aprobados, máximo 100 por página), así que se suman los
 * de `GET /products/admin/pending` para que "En revisión" tenga datos. Los ocultos por su vendedor no tienen
 * endpoint de admin: no se listan.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, type Product } from '@/services/ecommerce';
import { getPendingProducts } from '@/services/moderacion';

export type { Product };
export type ProductFilter = 'all' | 'published' | 'review' | 'out';

const MATCH: Record<ProductFilter, (p: Product) => boolean> = {
    all: () => true,
    published: (p) => p.is_approved !== false && p.is_active,
    review: (p) => p.is_approved === false,
    out: (p) => p.stock <= 0,
};

export function useAdminProducts() {
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ProductFilter>('all');
    const { data: published = [], isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => getProducts({ limit: 100 }),
    });
    const { data: pending = [], isLoading: loadingPending } = useQuery({
        queryKey: ['admin-products', 'pending'], // 'pending-products' lo usa moderación con otra forma
        queryFn: async () => (await getPendingProducts()) as Product[],
    });

    const products = useMemo(() => {
        const seen = new Set(published.map((p) => p.id));
        return [...pending.filter((p) => !seen.has(p.id)).map((p) => ({ ...p, is_approved: false })), ...published];
    }, [published, pending]);

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return products.filter((p) => MATCH[filter](p) && (!q || p.name.toLowerCase().includes(q)));
    }, [products, searchText, filter]);

    return {
        products: filtered,
        total: products.length,
        count: (f: ProductFilter) => products.filter(MATCH[f]).length,
        isLoading: isLoading || loadingPending,
        searchText,
        setSearchText,
        filter,
        setFilter,
        filtering: !!searchText.trim() || filter !== 'all',
        clearFilters: () => {
            setSearchText('');
            setFilter('all');
        },
    };
}
