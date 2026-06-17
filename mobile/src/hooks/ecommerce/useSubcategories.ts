/**
 * useSubcategories — Hook for managing product subcategories
 * Wires up getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} from '@/src/services/ecommerce';
import type { Subcategory } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';

export function useSubcategories(categoryId: string) {
    const queryClient = useQueryClient();
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

    const { data: subcategories = [], isLoading, refetch } = useQuery<Subcategory[]>({
        queryKey: ['subcategories', categoryId],
        queryFn: () => getSubcategories(categoryId),
        enabled: !!categoryId,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Subcategory>) => createSubcategory({ ...data, category_id: categoryId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', categoryId] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Subcategoría creada correctamente.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo crear la subcategoría.' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Subcategory> }) => updateSubcategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', categoryId] });
            setEditingSubcategory(null);
            showAlert({ type: 'success', title: 'Éxito', message: 'Subcategoría actualizada correctamente.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar la subcategoría.' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSubcategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', categoryId] });
            showAlert({ type: 'success', title: 'Eliminada', message: 'Subcategoría eliminada correctamente.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo eliminar la subcategoría.' });
        },
    });

    const handleCreate = (data: Partial<Subcategory>) => {
        createMutation.mutate(data);
    };

    const handleUpdate = (id: string, data: Partial<Subcategory>) => {
        updateMutation.mutate({ id, data });
    };

    const handleDelete = (id: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Subcategoría',
            message: '¿Estás seguro de eliminar esta subcategoría?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(id),
        });
    };

    return {
        // Data
        subcategories,
        isLoading,
        refetch,
        editingSubcategory,
        setEditingSubcategory,

        // Actions
        handleCreate,
        isCreating: createMutation.isPending,
        handleUpdate,
        isUpdating: updateMutation.isPending,
        handleDelete,
        isDeleting: deleteMutation.isPending,
    };
}

export type { Subcategory };
