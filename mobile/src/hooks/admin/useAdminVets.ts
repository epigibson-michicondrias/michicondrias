/**
 * useAdminVets — Business logic for the admin veterinarios screen
 * Fetches users and filters to show only veterinarians
 */
import { useQuery } from '@tanstack/react-query';
import { adminUsersService, AdminUser } from '@/src/services/adminUsers';
import { ROLE_IDS } from '@/src/constants/roles';
import { showAlert } from '@/src/components/AppAlert';

export type { AdminUser };

export function useAdminVets() {
    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-vets-users'],
        queryFn: () => adminUsersService.getUsers(),
    });

    const vets = users.filter(u => u.role_id === ROLE_IDS.VETERINARIO);

    const handleViewProfile = () => {
        showAlert({ type: 'info', title: 'Perfil', message: 'Ver perfil profesional' });
    };

    const handleManage = () => {
        showAlert({ type: 'info', title: 'Editar', message: 'Editar datos profesionales' });
    };

    const handleSearch = () => {
        showAlert({ type: 'info', title: 'Buscar', message: 'Buscar veterinarios' });
    };

    return {
        vets,
        isLoading,
        refetch,
        handleViewProfile,
        handleManage,
        handleSearch,
    };
}
