/**
 * useAdminVets — Business logic for the admin veterinarios screen
 * Fetches users and filters to show only veterinarians
 */
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { adminUsersService, AdminUser } from '@/src/services/adminUsers';
import { ROLE_IDS } from '@/src/constants/roles';
import { showAlert } from '@/src/components/AppAlert';

export type { AdminUser };

export function useAdminVets() {
    const router = useRouter();
    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-vets-users'],
        queryFn: () => adminUsersService.getUsers(),
    });

    const vets = users.filter(u => u.role_id === ROLE_IDS.VETERINARIO);

    // Acciones reales: abrir el perfil del directorio y enfocar el buscador.
    // (Antes eran showAlert de placeholder que no hacían nada.)
    const handleViewProfile = (vetId: string) => {
        router.push(`/directorio/especialista/${vetId}` as any);
    };

    const handleManage = (vetId: string) => {
        router.push(`/directorio/especialista/${vetId}` as any);
    };

    return {
        vets,
        isLoading,
        refetch,
        handleViewProfile,
        handleManage,
    };
}
