/**
 * useAdminProducts — todos los productos para el admin, incluidos los ocultos por su vendedor.
 * Usa `GET /products/admin/all` de un solo request. Trae los filtros por estado y las mutaciones
 * reales del admin: mostrar/ocultar (`PATCH .../visibility`) y aprobar/rechazar (moderación).
 * Espejo de `mobile/src/hooks/admin/useAdminProducts.ts`.
 */
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminProducts, setProductVisibility, type AdminProductFilter, type Product } from '@/services/ecommerce';
import { approveProduct, rejectProduct } from '@/services/moderacion';
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

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        // El catálogo público y la ficha del producto también cambian al mostrar/ocultar o moderar.
        queryClient.invalidateQueries({ queryKey: ['store-products'] });
        queryClient.invalidateQueries({ queryKey: ['product'] });
        queryClient.invalidateQueries({ queryKey: ['pending-products'] });
    };

    const visibilityMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setProductVisibility(id, isActive),
        onSuccess: (_, { isActive }) => {
            invalidate();
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

    const approveMutation = useMutation({
        mutationFn: (id: string) => approveProduct(id),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Producto aprobado', message: 'Ya está publicado en el catálogo.' });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo aprobar', message: errorMessage(e, 'Intenta de nuevo en un momento.') }),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => rejectProduct(id),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Producto rechazado', message: 'Se eliminó del catálogo.' });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo rechazar', message: errorMessage(e, 'Intenta de nuevo en un momento.') }),
    });

    /** Mostrar/ocultar: sin confirmación si se muestra, con confirmación si se oculta. */
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

    const approve = (p: Product) => {
        showAlert({
            type: 'info',
            title: 'Aprobar producto',
            message: `¿Publicar "${p.name}" en la tienda?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Aprobar',
            onButtonPress: () => approveMutation.mutate(p.id),
        });
    };

    const reject = (p: Product) => {
        showAlert({
            type: 'error',
            title: 'Rechazar producto',
            message: `¿Rechazar y eliminar "${p.name}"? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Rechazar',
            onButtonPress: () => rejectMutation.mutate(p.id),
        });
    };

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return products.filter((p) => MATCH[filter](p) && (!q || p.name.toLowerCase().includes(q)));
    }, [products, searchText, filter]);

    const busyId = visibilityMutation.isPending
        ? (visibilityMutation.variables?.id ?? null)
        : approveMutation.isPending
            ? (approveMutation.variables ?? null)
            : rejectMutation.isPending
                ? (rejectMutation.variables ?? null)
                : null;

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
        approve,
        reject,
        busyId,
    };
}
