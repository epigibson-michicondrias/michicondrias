/**
 * useAdminCategories — Business logic for the admin categories screen
 * Manages categories CRUD, modal state, and form data
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';

export type { Category };

export function useAdminCategories() {
    const queryClient = useQueryClient();
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const { data: categories = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: getCategories,
    });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Categoría creada correctamente.' });
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Category> }) => updateCategory(id, data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Categoría actualizada correctamente.' });
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Categoría eliminada.' });
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const handleAction = (category?: Category) => {
        setEditingCategory(category || null);
        setFormData({
            name: category?.name || '',
            description: category?.description || '',
        });
        setModalVisible(true);
    };

    const handleDelete = (id: string, name: string) => {
        showAlert({
            type: 'error',
            title: 'Eliminar Categoría',
            message: `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(id),
        });
    };

    const handleSubmit = () => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const closeModal = () => setModalVisible(false);

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return {
        categories,
        isLoading,
        refetch,
        isModalVisible,
        editingCategory,
        formData,
        setFormData,
        isSaving,
        handleAction,
        handleDelete,
        handleSubmit,
        closeModal,
    };
}
