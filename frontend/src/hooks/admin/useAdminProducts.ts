/**
 * useAdminProducts — todos los productos de la tienda para el admin, incluidos los ocultos por su vendedor.
 * Espejo de `mobile/src/hooks/admin/useAdminProducts.ts`. Usa `GET /products/admin/all` (un solo request;
 * antes se armaba a mano con el catálogo público y los pendientes, y los ocultos no aparecían).
 */
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminProducts, setProductVisibility, type AdminProductFilter, type Product } from '@/services/ecommerce';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

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
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ProductFilter>('all');

    const { data: products = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-products', 'all'],
        queryFn: () => getAdminProducts('all'),
    });

    const visibilityMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setProductVisibility(id, isActive),
        onSuccess: (_, { isActive }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            showAlert({
                type: 'success',
                title: isActive ? 'Producto visible' : 'Producto oculto',
                message: isActive
                    ? 'Ya vuelve a aparecer en la tienda.'
                    : 'Dejó de aparecer en la tienda. No se borró: puedes mostrarlo de nuevo.',
            });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo cambiar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    const toggleVisibility = (p: Product) => {
        const hide = !!p.is_active;
        if (!hide) {
            visibilityMutation.mutate({ id: p.id, isActive: true });
            return;
        }
        showAlert({
            type: 'warning',
            title: 'Ocultar producto',
            message: `"${p.name}" dejará de aparecer en la tienda. No se borra: puedes mostrarlo de nuevo. ¿Continuar?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Ocultar',
            onButtonPress: () => visibilityMutation.mutate({ id: p.id, isActive: false }),
        });
    };

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
        toggleVisibility,
        updatingId: visibilityMutation.isPending ? (visibilityMutation.variables?.id ?? null) : null,
    };
}
