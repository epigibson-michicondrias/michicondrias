/**
 * useAdminDashboard — Business logic for the admin dashboard screen
 * Wraps useQuery calls for user stats and clinic counts
 */
import { useQuery } from '@tanstack/react-query';
import { adminUsersService } from '@/src/services/adminUsers';
import { getClinics } from '@/src/services/directorio';

export function useAdminDashboard() {
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminUsersService.getUsersStats(),
    });

    const { data: clinics = [] } = useQuery({
        queryKey: ['admin-clinics'],
        queryFn: () => getClinics(),
    });

    const totalUsers = stats?.total_users || 0;
    const vetCount = stats?.role_distribution?.['veterinario'] || 0;
    const consumerCount = stats?.role_distribution?.['consumidor'] || 0;
    const sitterCount = (stats?.role_distribution?.['paseador'] || 0) + (stats?.role_distribution?.['cuidador'] || 0);
    const clinicCount = clinics.length;

    return {
        totalUsers,
        vetCount,
        consumerCount,
        sitterCount,
        clinicCount,
    };
}
