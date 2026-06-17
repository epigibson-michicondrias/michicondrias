/**
 * useSellerProducts — Data fetching and mutations for seller product catalog
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { getMyProducts, deleteProduct, updateProduct, Product } from '@/src/services/ecommerce';

export function useSellerProducts() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['my-products'],
        queryFn: getMyProducts,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Producto eliminado correctamente' });
        },
        onError: () => showAlert({ type: 'error', title: 'Error', message: 'No se pudo eliminar el producto' }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => updateProduct(id, { is_active: !active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
        },
    });

    const handleDelete = (id: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Producto',
            message: '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(id),
        });
    };

    const toggleProductStatus = (id: string, active: boolean) => {
        toggleStatusMutation.mutate({ id, active });
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return {
        products,
        filteredProducts,
        isLoading,
        searchQuery,
        setSearchQuery,
        handleDelete,
        toggleProductStatus,
    };
}
