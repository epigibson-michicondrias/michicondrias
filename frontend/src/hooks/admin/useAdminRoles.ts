/**
 * useAdminRoles — Business logic for the admin roles screen
 * Manages roles CRUD, modal state, and form data
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService, type AdminRole } from '@/services/adminUsers';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

export type Role = AdminRole;

export function useAdminRoles() {
    const queryClient = useQueryClient();
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminUsersService.getRoles(),
    });

    const createMutation = useMutation({
        mutationFn: (data: { name: string; description?: string | null }) => adminUsersService.createRole(data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Rol creado correctamente.' });
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error) => showAlert({ type: 'error', title: 'Error', message: errorMessage(error, 'Inténtalo de nuevo.') })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { name?: string; description?: string | null } }) => adminUsersService.updateRole(id, data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Rol actualizado correctamente.' });
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error) => showAlert({ type: 'error', title: 'Error', message: errorMessage(error, 'Inténtalo de nuevo.') })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminUsersService.deleteRole(id),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Rol eliminado.' });
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error) => showAlert({ type: 'error', title: 'Error', message: errorMessage(error, 'Inténtalo de nuevo.') })
    });

    const handleAction = (role?: Role) => {
        setEditingRole(role || null);
        setFormData({
            name: role?.name || '',
            description: role?.description || '',
        });
        setModalVisible(true);
    };

    const handleDelete = (id: string, name: string) => {
        showAlert({
            type: 'error',
            title: 'Eliminar Rol',
            message: `¿Estás seguro de eliminar "${name}"?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(id),
        });
    };

    const handleSubmit = () => {
        if (editingRole) {
            updateMutation.mutate({ id: editingRole.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const closeModal = () => setModalVisible(false);

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return {
        roles,
        isLoading,
        isModalVisible,
        editingRole,
        formData,
        setFormData,
        isSaving,
        handleAction,
        handleDelete,
        handleSubmit,
        closeModal,
    };
}
