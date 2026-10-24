/**
 * useAdminProducts — todos los productos para el admin, incluidos los ocultos por su vendedor.
 * Usa `GET /products/admin/all` de un solo request. Trae los filtros por estado y las mutaciones
 * reales del admin: mostrar/ocultar (`PATCH .../visibility`) y aprobar/rechazar (moderación).
 */
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminProducts, setProductVisibility, type AdminProductFilter, type Product } from '@/src/services/ecommerce';
import { approveProduct, rejectProduct } from '@/src/services/moderacion';
import { showAlert } from '@/src/components/AppAlert';
import { errorMessage } from '@/src/hooks/servicios-pro/requestStatus';

export type { Product };
export type ProductFilter = AdminProductFilter;

const MATCH: Record<Exclude<AdminProductFilter, 'all'>, (p: Product) => boolean> & { all: (p: Product) => boolean } = {
    all: () => true,
    published: (p) => p.is_approved !== false && p.is_active,
    review: (p) => p.is_approved === false,
    hidden: (p) => p.is_active === false,
    out: (p) => (p.stock ?? 0) <= 0,
};

const QUERY_KEY = ['admin-products', 'all'];

export function useAdminProducts() {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [filter, setFilter] = useState<ProductFilter>('all');

    const { data: products = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => getAdminProducts('all'),
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    };

    const visibilityMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setProductVisibility(id, isActive),
        onSuccess: (_, { isActive }) => {
            invalidate();
            showAlert({
                type: 'success',
                title: isActive ? 'Producto visible' : 'Producto oculto',
                message: isActive
                    ? 'Vuelve a aparecer en el catálogo público.'
                    : 'Ya no aparece en el catálogo público. Se conservan sus datos y pedidos.',
            });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo cambiar', message: errorMessage(e, 'Inténtalo de nuevo.') }),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => approveProduct(id),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Producto aprobado', message: 'Ya está publicado en el catálogo.' });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo aprobar', message: errorMessage(e, 'Inténtalo de nuevo.') }),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => rejectProduct(id),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Producto rechazado', message: 'Se eliminó del catálogo.' });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo rechazar', message: errorMessage(e, 'Inténtalo de nuevo.') }),
    });

    /** Mostrar/ocultar: sin confirmación si se muestra, con confirmación si se oculta. */
    const toggleVisibility = (p: Product) => {
        const isActive = p.is_active === false;
        if (isActive) {
            visibilityMutation.mutate({ id: p.id, isActive: true });
            return;
        }
        showAlert({
            type: 'warning',
            title: 'Ocultar producto',
            message: `«${p.name}» dejará de aparecer en el catálogo. Sus pedidos se conservan. ¿Continuar?`,
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
            message: `¿Publicar «${p.name}» en el catálogo?`,
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
            message: `¿Rechazar y eliminar «${p.name}»? Esta acción no se puede deshacer.`,
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
        ? (visibilityMutation.variables as { id: string } | undefined)?.id
        : approveMutation.isPending
            ? (approveMutation.variables as string)
            : rejectMutation.isPending
                ? (rejectMutation.variables as string)
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
