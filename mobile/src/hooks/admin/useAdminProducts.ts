/**
 * useAdminProducts — todos los productos para el admin, incluidos los ocultos por su vendedor.
 * Usa `GET /products/admin/all` (antes solo se veía el catálogo público y los ocultos no aparecían).
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminProducts, type AdminProductFilter, type Product } from '@/src/services/ecommerce';

export type { Product };
export type ProductFilter = AdminProductFilter;

const MATCH: Record<Exclude<AdminProductFilter, 'all'>, (p: Product) => boolean> & { all: (p: Product) => boolean } = {
    all: () => true,
    published: (p) => p.is_approved !== false && p.is_active,
    review: (p) => p.is_approved === false,
    hidden: (p) => p.is_active === false,
    out: (p) => (p.stock ?? 0) <= 0,
};

export function useAdminProducts() {
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ProductFilter>('all');

    const { data: products = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-products', 'all'],
        queryFn: () => getAdminProducts('all'),
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
        isFetching,
        refetch,
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
