/**
 * useVetDetail — Data fetching for the specialist detail screen
 * Fetches the vet matching the route param
 */
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getVet, getClinic, getClinicServices } from '@/src/services/directorio';

export function useVetDetail() {
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const vetId = id as string;

    const { data: specialist, isLoading, isError, refetch } = useQuery({
        queryKey: ['vet', vetId],
        queryFn: () => getVet(vetId),
        enabled: !!vetId,
    });
    const clinicId = specialist?.clinic_id;

    const { data: clinic, isLoading: isLoadingClinic } = useQuery({
        queryKey: ['clinic', clinicId],
        queryFn: () => getClinic(clinicId!),
        enabled: !!clinicId,
    });

    const { data: services = [], isLoading: isLoadingServices } = useQuery({
        queryKey: ['clinic-services', clinicId],
        queryFn: () => getClinicServices(clinicId!),
        enabled: !!clinicId,
    });

    return {
        vetId,
        /** El propio veterinario no se reseña a sí mismo (el backend responde 403). */
        canReview: !!user && !!specialist && specialist.user_id !== user.id,
        specialist,
        isLoading,
        isError,
        refetch,
        clinic,
        isLoadingClinic,
        services,
        isLoadingServices,
    };
}
