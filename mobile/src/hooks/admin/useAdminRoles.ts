/**
 * useAdminRoles — Business logic for the admin roles screen
 * Manages roles CRUD, modal state, and form data
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/src/services/adminUsers';
import { showAlert } from '@/src/components/AppAlert';

export type Role = {
    id: string;
    name: string;
    description: string;
    users_count: number;
    color: string;
};

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
        mutationFn: (data: any) => adminUsersService.createRole(data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Rol creado correctamente.' });
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => adminUsersService.updateRole(id, data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Rol actualizado correctamente.' });
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminUsersService.deleteRole(id),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Rol eliminado.' });
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
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
