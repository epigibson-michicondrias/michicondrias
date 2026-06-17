/**
 * useAdminUsers — Business logic for the admin users screen
 * Wraps queries, mutations, search/filter state, and form state for user CRUD
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService, AdminUser } from '@/src/services/adminUsers';
import { ROLE_IDS, ROLE_COLORS, getRoleName } from '@/src/constants/roles';
import { showAlert } from '@/src/components/AppAlert';

export interface UserFormData {
    full_name: string;
    email: string;
    password: string;
    role_id: string;
}

const INITIAL_FORM: UserFormData = {
    full_name: '',
    email: '',
    password: '',
    role_id: ROLE_IDS.CONSUMIDOR,
};

export function useAdminUsers() {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM);

    // Query
    const { data: users = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminUsersService.getUsers(),
    });

    // Mutations
    const toggleUserStatus = useMutation({
        mutationFn: async (userId: string) => {
            return adminUsersService.toggleUserStatus(userId);
        },
        onSuccess: (data) => {
            showAlert({ type: 'success', title: 'Éxito', message: `Usuario ${data.is_active ? 'activado' : 'desactivado'} correctamente.` });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'Error', message: error.message || "No se pudo cambiar el estado del usuario" });
        }
    });

    const createUserMutation = useMutation({
        mutationFn: (data: any) => adminUsersService.createUser(data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Usuario creado correctamente.' });
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message || "No se pudo crear el usuario" })
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => adminUsersService.updateUser(id, data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Usuario actualizado correctamente.' });
            setModalVisible(false);
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message || "No se pudo actualizar el usuario" })
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return adminUsersService.deleteUser(userId);
        },
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Usuario eliminado correctamente.' });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'Error', message: error.message || "No se pudo eliminar el usuario" });
        }
    });

    // Handlers
    const handleDeletePress = (userId: string, name: string) => {
        showAlert({
            type: 'error',
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteUserMutation.mutate(userId),
        });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData(INITIAL_FORM);
        setModalVisible(true);
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            password: '',
            role_id: user.role_id || ROLE_IDS.CONSUMIDOR,
        });
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingUser(null);
    };

    const handleSubmit = () => {
        if (editingUser) {
            updateUserMutation.mutate({
                id: editingUser.id,
                data: {
                    full_name: formData.full_name,
                    email: formData.email,
                    role_id: formData.role_id
                }
            });
        } else {
            createUserMutation.mutate(formData);
        }
    };

    // Filtering
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchText.toLowerCase());

        const userRoleName = getRoleName(user.role_id, user.role_name).toLowerCase();

        let normalizedUserRole = userRoleName;
        if (userRoleName === 'veterinarian') normalizedUserRole = 'veterinario';
        if (userRoleName === 'user' || userRoleName === 'usuario') normalizedUserRole = 'consumidor';
        if (userRoleName === 'desconocido') normalizedUserRole = 'unassigned';

        const matchesRole = filterRole === 'all' || normalizedUserRole === filterRole;
        return matchesSearch && matchesRole;
    });

    // Helpers
    const getRoleColorLocal = (role: string) => {
        if (!role || role === 'unassigned' || role === 'desconocido') return '#6b7280';
        const normalizedRole = role.toLowerCase();
        if (normalizedRole === 'veterinarian') return ROLE_COLORS.veterinario;
        if (normalizedRole === 'user') return ROLE_COLORS.consumidor;
        return ROLE_COLORS[normalizedRole as keyof typeof ROLE_COLORS] || "#6b7280";
    };

    const getRoleLabelLocal = (role: string) => {
        if (!role || role === 'unassigned' || role === 'desconocido') return 'Sin Rol';
        const normalizedRole = role.toLowerCase();
        switch (normalizedRole) {
            case 'admin': return 'Administrador';
            case 'veterinario':
            case 'veterinarian': return 'Veterinario';
            case 'paseador': return 'Paseador';
            case 'consumidor':
            case 'user': return 'Usuario';
            default: return role;
        }
    };

    const activeCount = users.filter(u => u.is_active).length;

    return {
        // Data
        users,
        filteredUsers,
        activeCount,
        isLoading,
        isFetching,
        refetch,

        // Search / Filter
        searchText,
        setSearchText,
        filterRole,
        setFilterRole,

        // Modal state
        modalVisible,
        editingUser,
        formData,
        setFormData,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit,

        // Mutations
        toggleUserStatus,
        createUserMutation,
        updateUserMutation,
        handleDeletePress,

        // Helpers
        getRoleColorLocal,
        getRoleLabelLocal,
    };
}
