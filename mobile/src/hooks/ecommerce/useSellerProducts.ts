/**
 * useSellerProducts — Catálogo del vendedor: búsqueda, filtros por estado (publicado, en revisión, oculto, agotado),
 * mostrar/ocultar y eliminar.
 */
import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import type { Product } from '@/src/types/ecommerce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { getMyProducts, deleteProduct, updateProduct } from '@/src/services/ecommerce';

/** Filtros del catálogo; `filtro` en la URL abre uno directo (desde los avisos del panel). */
export const CATALOG_FILTERS = [
    { key: 'todos', label: 'Todos', match: () => true },
    { key: 'publicados', label: 'Publicados', match: (p: Product) => p.is_active && p.is_approved !== false },
    { key: 'revision', label: 'En revisión', match: (p: Product) => p.is_approved === false },
    { key: 'ocultos', label: 'Ocultos', match: (p: Product) => !p.is_active },
    { key: 'agotados', label: 'Agotados', match: (p: Product) => p.stock <= 0 },
] as const;
export type CatalogFilter = (typeof CATALOG_FILTERS)[number]['key'];

export function useSellerProducts() {
    const queryClient = useQueryClient();
    const { filtro } = useLocalSearchParams<{ filtro?: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<CatalogFilter>(
        CATALOG_FILTERS.some((f) => f.key === filtro) ? (filtro as CatalogFilter) : 'todos',
    );

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['my-products'],
        queryFn: getMyProducts,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            showAlert({ type: 'success', title: 'Listo', message: 'Producto eliminado. Si ya tenía ventas, se ocultó para conservar el historial.' });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo eliminar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => updateProduct(id, { is_active: !active }),
        onSuccess: (_, { active }) => {
            showAlert({
                type: 'success',
                title: active ? 'Producto oculto' : 'Producto publicado',
                message: active ? 'Ya no aparece en la tienda. Puedes volver a publicarlo cuando quieras.' : 'Ya se puede comprar en Michi-Shop.',
            });
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const handleDelete = (id: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar producto',
            message: 'Se quitará de tu catálogo y de la tienda. Si ya tuvo ventas, se oculta para conservar el historial. No se puede deshacer.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(id),
        });
    };

    const toggleProductStatus = (id: string, active: boolean) => {
        toggleStatusMutation.mutate({ id, active });
    };

    const counts = useMemo(
        () => Object.fromEntries(CATALOG_FILTERS.map((f) => [f.key, products.filter(f.match).length])) as Record<CatalogFilter, number>,
        [products],
    );

    const filteredProducts = useMemo(() => {
        const match = CATALOG_FILTERS.find((f) => f.key === filter)!.match;
        const q = searchQuery.trim().toLowerCase();
        return products.filter((p) => match(p) && (!q || p.name.toLowerCase().includes(q)));
    }, [products, filter, searchQuery]);

    return {
        products,
        filteredProducts,
        filter,
        setFilter,
        counts,
        togglingId: toggleStatusMutation.isPending ? toggleStatusMutation.variables?.id : undefined,
        isLoading,
        searchQuery,
        setSearchQuery,
        handleDelete,
        toggleProductStatus,
    };
}
